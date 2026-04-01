const express = require("express");
const router = express.Router();
const Staff = require("../model/Staff");
const Institute = require("../model/Institute"); // Add institute model
const bcrypt = require("bcryptjs");
const course = require("../model/courseModal")



const generateStaffId = async () => {
  let uniqueId;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    uniqueId = `STAFF-${randomNumber}`;

    exists = await Staff.findOne({ staffId: uniqueId });
  }

  return uniqueId;
};



// router.post("/addStaff", async (req, res) => {    
//   try {
//     const { email, password, name } = req.body;
//     const inInstitute = await Institute.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
//     if (inInstitute) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered as Institute. Cannot add as Staff."
//       });
//     }


//     const inStaff = await Staff.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
//     if (inStaff) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered as Staff."
//       });
//     }

  
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newStaff = new Staff({
//       email,
//       password: hashedPassword,
//       name,
//       ...req.body // map any other fields from frontend
//     });

//     await newStaff.save();

//     res.status(201).json({
//       success: true,
//       message: "Staff member added successfully",
//       staff: newStaff
//     });
//   } catch (error) {
//     console.error("Error adding staff:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

router.post("/addStaff", async (req, res) => {    
  try {
    const { email, password } = req.body;

    // ✅ check institute
    const inInstitute = await Institute.findOne({
      email: { $regex: `^${email}$`, $options: "i" }
    });

    if (inInstitute) {
      return res.status(400).json({
        success: false,
        message: "Email already registered as Institute"
      });
    }

    // ✅ check staff
    const inStaff = await Staff.findOne({
      Email: { $regex: `^${email}$`, $options: "i" }
    });

    if (inStaff) {
      return res.status(400).json({
        success: false,
        message: "Email already registered as Staff"
      });
    }

    // 🔥 STEP 1: Generate staffId
    const staffId = await generateStaffId();

    // 🔥 STEP 2: hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 STEP 3: create staff (IMPORTANT LINE)
    const newStaff = new Staff({
      ...req.body,
      password: hashedPassword,
      staffId: staffId   // 👈 yaha assign karo
    });

    await newStaff.save();

    res.status(201).json({
      success: true,
      message: "Staff member added successfully",
      staff: newStaff
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.get("/allStaff", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });

    if (!staff || staff.length === 0) {
      return res.status(404).json({ success: false, message: "No staff found" });
    }

    // MongoId remove karke clean response
    const staffData = staff.map(s => ({
      staffId: s.staffId,
      firstName: s.firstName,
      middleName: s.middleName,
      LastName: s.LastName,
      Email: s.Email,
      ContactNumber: s.ContactNumber,
      UserRole: s.UserRole,
      instituteId: s.instituteId, // agar string hai
      createdAt: s.createdAt
    }));

    res.status(200).json({
      success: true,
      count: staffData.length,
      staff: staffData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


router.get("/search/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const staff = await Staff.findOne({ email }); // Use correct field name 'email'

    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


router.put("/updateStaff/:id", async (req, res) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedStaff) return res.status(404).json({ success: false, message: "Staff not found" });

    res.status(200).json({ success: true, message: "Staff updated successfully", data: updatedStaff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


router.get("/getStaffByEmpId/:empId", async (req, res) => {
  try {
    const { empId } = req.params;
    const staff = await Staff.findOne({ EmployeeId: empId });

    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found with this Employee ID" });

    res.status(200).json({ success: true, staff });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/add-and-approve/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId, studentName } = req.body; 

    const alreadyExists = await course.findOne({
      _id: courseId,
      "enrolledStudents.studentId": studentId
    });

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Student is already added to this course."
      });
    }


    const updatedCourse = await course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          enrolledStudents: {
            studentId: studentId,
            name: studentName,
            status: "APPROVED", 
            appliedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Student added and approved by Institute successfully!",
      data: updatedCourse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



router.delete("/deleteStaff/:id", async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) return res.status(404).json({ success: false, message: "Staff not found" });

    res.status(200).json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



router.get("/teacher/:id/classes", async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Staff.findOne({
      _id: id,
      UserRole: "Teacher"
    }).select("firstName LastName assignedClasses");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({
      teacherName: `${teacher.firstName} ${teacher.LastName || ""}`,
      totalClasses: teacher.assignedClasses.length,
      assignedClasses: teacher.assignedClasses
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/teacher/:teacherId/requests", async (req, res) => {
  try {
    const courses = await course.find({
      classTeacher: req.params.teacherId
    });

    const pending = [];

    courses.forEach(c => {
      c.enrolledStudents.forEach(s => {
        if (s.status === "PENDING") {
          pending.push({
            course: c.name,
            student: s
          });
        }
      });
    });

    res.json(pending);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/approve-student", async (req, res) => {
  try {
    const { courseId, studentId } = req.body;

    await course.findOneAndUpdate(
      {
         courseId: courseId,
        "enrolledStudents.studentId": studentId
      },
      {
        $set: {
          "enrolledStudents.$.status": "APPROVED"
        }
      }
    );

    res.json({ message: "Student approved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;