const express = require("express");
const router = express.Router();
const Courses = require("../model/courseModal");
const Student = require("../model/Student");
const verifyInstituteToken = require("../middleware/auth");


router.post("/create", async (req, res) => {
  try {

    const generateCourseId = async () => {
      let uniqueId;
      let exists = true;

      while (exists) {
        const randomNumber = Math.floor(10000 + Math.random() * 90000);
        uniqueId = `COURSE-${randomNumber}`;
        exists = await Courses.findOne({ courseId: uniqueId });
      }
      return uniqueId;
    };

    const generateSubjectId = () => {
      return `SUB-${Math.floor(1000 + Math.random() * 9000)}`;
    };

    const courseId = await generateCourseId();

    let subjectsWithId = [];

    if (req.body.subjects && req.body.subjects.length > 0) {
      subjectsWithId = req.body.subjects.map((sub) => ({
        subjectId: generateSubjectId(),
        name: sub.name || sub,
        subjectTeacher: [] // ✅ array rakho
      }));
    }

    const newCourse = new Courses({
      ...req.body,
      courseId,
      subjects: subjectsWithId
      // ❌ instituteId hata diya
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully ✅",
      course: newCourse
    });

  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



router.get("/all", async (req, res) => {
  try {
    //  console.log("SESSION:", req.session); // 👈 add this

  //  const instituteId = req.session.instituteId;

    // if (!instituteId) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Login required"
    //   });
    // }
    const courses = await Courses.find()
      .sort({ createdAt: -1 })
      .lean();

    if (!courses.length) {
      return res.status(404).json({
        success: false,
        message: "No courses found"
      });
    }

    const courseData = courses.map(course => ({
      courseId: course.courseId,
      name: course.name,
      students: course.students,
      status: course.status,
      duration: course.duration,
      classTeacher: course.classTeacher,
      
      nextBatch: course.nextBatch,
      description: course.description,
      subjects: course.subjects,

      
      enrolledStudents: (course.enrolledStudents || []).map(s => ({
        studentId: s.studentId,
        name: s.name,
        status: s.status,
        appliedAt: s.appliedAt
      })),

      createdAt: course.createdAt
    }));

    res.status(200).json({
      success: true,
      courses: courseData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/course/:courseId", async (req, res) => {
  try {
    // 1. POPULATE HATA DEIN (Kyunki aap STAFF-ID string save kar rahe hain, ObjectId nahi)
    const course = await Courses.findOne({ courseId: req.params.courseId });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. DATA MAPPING (Subjects aur Teachers ko safely handle karein)
    const courseData = {
      ...course._doc,
      
      // Agar classTeacher array hai toh pehla element dikhao, warna direct string
      displayTeacher: Array.isArray(course.classTeacher) 
        ? course.classTeacher[0] 
        : course.classTeacher,

      // Subjects array ko ensure karein
      subjects: course.subjects || [],

      enrolledStudents: (course.enrolledStudents || []).map(s => ({
        studentId: s.studentId,
        name: s.name,
        status: s.status,
        appliedAt: s.appliedAt
      }))
    };

    // 3. SUCCESS RESPONSE
    res.status(200).json({ success: true, course: courseData });

  } catch (error) {
    console.error("GET COURSE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// GET /courses/institute/:instituteId


router.get("/institute/:instituteId", async (req, res) => {
  try {
    const { instituteId } = req.params;

    // Courses fetch kar rahe instituteId ke basis pe          
    const courses = await Courses.find({ instituteId }).populate("classTeacher").sort({ createdAt: -1 });

    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/teacher/:teacherId", verifyInstituteToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const courses = await Courses.find({
      classTeacher: teacherId,
      instituteId: req.institute.instituteId
    })
      .populate("classTeacher")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, courses });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put("/assignStudent/:courseId/:studentId", async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    const course = await Courses.findOne({ courseId }); // string wala
    const student = await Student.findOne({ studentID: studentId });

    if (!course || !student) {
      return res.json({ success: false, message: "Not found" });
    }

    // ✅ SAME INSTITUTE CHECK
    if (
      student.instituteId.toString() !==
      course.instituteId.toString()
    ) {
      return res.json({
        success: false,
        message: "Different institute ❌"
      });
    }

    // already check
    const exists = course.enrolledStudents.find(
      (s) => s.studentId === studentId
    );

    if (exists) {
      return res.json({ success: false, message: "Already added" });
    }

    // ✅ add in course
    course.enrolledStudents.push({
      studentId: student.studentID,
      name: student.fullName,
      status: "APPROVED"
    });

    await course.save();

    // 🔥 MAIN FIX HERE
    student.courseId = course._id;   // ✅ ObjectId use karo
    student.approvalStatus = "APPROVED";

    await student.save();

    res.json({ success: true, message: "Assigned successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// for classteacher assign
router.put("/updateCourse/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Agar frontend se direct classTeacher bhej rahe ho 
    // to hum database me $addToSet use karenge taaki duplicate add na ho
    let updateData = { ...req.body };
    
    if (req.body.classTeacher) {
      // Isse classTeacher array me sirf string ID push hogi, koi objectId nahi
      await Courses.findOneAndUpdate(
        { courseId: courseId },
        { $addToSet: { classTeacher: req.body.classTeacher } },
        { new: true }
      );
      delete updateData.classTeacher; // Alag se update ho gaya to body se hata do
    }

    // Baaki bachi hui fields ke liye
    const updatedCourse = await Courses.findOneAndUpdate(
      { courseId: courseId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ✅ ASSIGN TEACHER TO SPECIFIC SUBJECT
router.put("/assignSubjectTeacher", async (req, res) => {
  try {
    const { courseId, subjectId, teacherId } = req.body;

    console.log("👉 courseId:", courseId);
    console.log("👉 subjectId:", subjectId);
    console.log("👉 teacherId:", teacherId);

    // ❌ agar teacherId hi nahi aaya
    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "teacherId is required ❌"
      });
    }

    const course = await Courses.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found ❌"
      });
    }

    console.log("📚 All Subjects:", course.subjects);

    const subjectIndex = course.subjects.findIndex(
      (sub) => sub.subjectId === subjectId
    );

    console.log("👉 Found Index:", subjectIndex);

    if (subjectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Subject not found ❌"
      });
    }

    // ✅ IMPORTANT FIX (array push)
    if (!course.subjects[subjectIndex].subjectTeacher) {
      course.subjects[subjectIndex].subjectTeacher = [];
    }

    // duplicate check
    if (
      course.subjects[subjectIndex].subjectTeacher.includes(teacherId)
    ) {
      return res.json({
        success: false,
        message: "Teacher already assigned ⚠️"
      });
    }

    console.log("✅ Before Save:", course.subjects[subjectIndex]);

    course.subjects[subjectIndex].subjectTeacher.push(teacherId);

    await course.save();

    console.log("✅ After Save:", course.subjects[subjectIndex]);

    res.json({
      success: true,
      message: "Subject teacher assigned successfully ✅",
      subject: course.subjects[subjectIndex]
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// ROUTE TO REMOVE A TEACHER FROM ARRAY
router.put("/removeTeacher/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { teacherId } = req.body; // STAFF-XXXX format me

    const updatedCourse = await Courses.findOneAndUpdate(
      { courseId: courseId },
      { $pull: { classTeacher: teacherId } }, // Array se remove karne ke liye
      { new: true }
    );

    res.status(200).json({ success: true, course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// 5. GET COURSES BY TEACHER ID (STAFF-X)
router.get("/teacher-courses/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Isse wo saare courses mil jayenge jahan classTeacher array mein ye ID exist karti hai
    const courses = await Courses.find({
      classTeacher: teacherId // MongoDB automatically array ke andar check kar leta hai
    }).sort({ createdAt: -1 });

    if (courses.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Is teacher ke liye koi course nahi mila." 
      });
    }

    res.status(200).json({ 
      success: true, 
      count: courses.length, 
      courses 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// router.put("/approveStudent", async (req, res) => {
//   try {
//     const { courseId, studentID } = req.body;

//     // course find
//     const course = await Courses.findOne({ courseId });
//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     // student find in course
//     const student = course.enrolledStudents.find(
//       (s) => s.studentId === studentID
//     );

//     if (!student) {
//       return res.status(404).json({ message: "Student not found in course" });
//     }


//     if (student.status === "APPROVED") {
//       return res.json({ message: "Already approved" });
//     }

//     // ✅ APPROVE
//     student.status = "APPROVED";

//     // ✅ update total students count
//     course.students = course.enrolledStudents.filter(
//       (s) => s.status === "APPROVED"
//     ).length;

//     await course.save();

//     res.json({
//       success: true,
//       message: "Student approved successfully",
//       course,
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



router.delete("/deleteCourse/:courseId",verifyInstituteToken, async (req, res) => {
  try {
    const deletedCourse = await Courses.findOneAndDelete({ courseId: req.params.courseId , instituteId: req.institute.instituteId});
    if (!deletedCourse) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});router.get("/course/:courseId/access/:studentId", async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    // ✅ FIX HERE
    const courseData = await Courses.findOne({ courseId });

    if (!courseData) {
      return res.status(404).json({ message: "Course not found" });
    }

    const student = courseData.enrolledStudents.find(
      s => s.studentId === studentId
    );

    if (!student || student.status !== "APPROVED") {
      return res.status(403).json({
        access: false,
        message: "Course Locked 🔒"
      });
    }

    res.json({
      access: true,
      course: courseData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;