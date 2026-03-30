const express = require("express");
const router = express.Router();
const Courses = require("../model/courseModal");
    const Student = require("../model/Student");

/* ================= CREATE COURSE ================= */
router.post("/create", async (req, res) => {
  try {
    const {
      name, students, status, classTeacher, 
      duration, progress, maxSeats, nextBatch, description, subjects
    } = req.body;

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

    const courseId = await generateCourseId();

    const newCourse = new Courses({
      courseId, name, students, status, classTeacher,
      duration, progress, maxSeats, nextBatch, description, subjects
    });

    await newCourse.save();
    res.status(201).json({ success: true, message: "Course created successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get("/all", async (req, res) => {
  try {
    // .populate("classTeacher") add kiya taaki list mein bhi naam dikhe
    const courses = await Courses.find().populate("classTeacher").sort({ createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/assignStudent/:courseId/:studentId", async (req, res) => {
  try {
    
    const { courseId, studentId } = req.params;

    const course = await Courses.findOne({ courseId });
    const student = await Student.findOne({ studentID: studentId });

    if (!course || !student) {
      return res.json({ success: false, message: "Not found" });
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

    // ✅ FIX HERE
    student.courseId = courseId;        // ⭐⭐⭐ MOST IMPORTANT
    student.approvalStatus = "APPROVED";

    await student.save();

    res.json({ success: true, message: "Assigned successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*  GET SINGLE (UPDATED WITH POPULATE) */
router.get("/course/:courseId", async (req, res) => {
  try {
    // .populate("classTeacher") add kiya taaki refresh karne par naam na hate
    const course = await Courses.findOne({ courseId: req.params.courseId }).populate("classTeacher");
    
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ================= UPDATE COURSE (UPDATED WITH POPULATE) ================= */
router.put("/updateCourse/:courseId", async (req, res) => {
  try {
    const updatedCourse = await Courses.findOneAndUpdate(
      { courseId: req.params.courseId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("classTeacher"); // Populate here too so UI updates immediately

    if (!updatedCourse) return res.status(404).json({ success: false, message: "Course not found" });

    res.status(200).json({ success: true, message: "Updated successfully", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ================= REMOVE TEACHER ================= */
router.put("/removeTeacher/:courseId", async (req, res) => {
  try {
    const updatedCourse = await Courses.findOneAndUpdate(
      { courseId: req.params.courseId },
      { $set: { classTeacher: null } },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Teacher removed", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.put("/approveStudent", async (req, res) => {
  try {
    const { courseId, studentID } = req.body;

    // course find
    const course = await Courses.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // student find in course
    const student = course.enrolledStudents.find(
      (s) => s.studentId === studentID
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found in course" });
    }


    if (student.status === "APPROVED") {
      return res.json({ message: "Already approved" });
    }

    // ✅ APPROVE
    student.status = "APPROVED";

    // ✅ update total students count
    course.students = course.enrolledStudents.filter(
      (s) => s.status === "APPROVED"
    ).length;

    await course.save();

    res.json({
      success: true,
      message: "Student approved successfully",
      course,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







/* ================= DELETE ================= */
router.delete("/deleteCourse/:courseId", async (req, res) => {
  try {
    const deletedCourse = await Courses.findOneAndDelete({ courseId: req.params.courseId });
    if (!deletedCourse) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;