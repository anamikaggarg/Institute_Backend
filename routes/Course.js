const express = require("express");
const router = express.Router();
const Courses = require("../model/courseModal"); // ✅ rename model


router.post("/create", async (req, res) => {
  try {
    const {
      name,
      students,
      status,
      faculty,
      duration,
      progress,
      maxSeats,
      nextBatch,
      description
    } = req.body;

    const newCourse = new Courses({
      name,
      students,
      status,
      faculty,
      duration,
      progress,
      maxSeats,
      nextBatch,
      description
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse
    });

  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const courses = await Courses.find().sort({ createdAt: -1 });

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found"
      });
    }

    // Manual mapping taaki sirf selected fields hi jayen (No _id show)
    const courseData = courses.map(course => ({
      name: course.name,
      students: course.students,
      status: course.status,
      faculty: course.faculty,
      duration: course.duration,
      progress: course.progress,
      maxSeats: course.maxSeats,
      nextBatch: course.nextBatch,
      description: course.description,
      subjects: course.subjects // Agar subjects array hai toh wo bhi chala jayega
    }));

    res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      courses: courseData
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


router.get("/course/:id", async (req, res) => {
  try {
    const course = await Courses.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Course fetched",
      course: course
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.put("/updateCourse/:id", async (req, res) => {
  try {
    const updatedCourse = await Courses.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse
    });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
/* ===================== ASSIGN TEACHER ===================== */
router.put("/assignTeacher/:id", async (req, res) => {
  try {
    const { facultyName } = req.body; // Frontend se teacher ka full name bhejenge

    if (!facultyName) {
      return res.status(400).json({ success: false, message: "Teacher name is required" });
    }

    const updatedCourse = await Courses.findByIdAndUpdate(
      req.params.id,
      { $set: { faculty: facultyName } }, // Sirf faculty field ko update karega
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      message: `Teacher ${facultyName} assigned successfully`,
      course: updatedCourse
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===================== DELETE COURSE ===================== */
router.delete("/deleteCourse/:id", async (req, res) => {
  try {
    const deletedCourse = await Courses.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;