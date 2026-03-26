const express = require("express");
const router = express.Router();
const Courses = require("../model/courseModal");

/* ================= CREATE COURSE ================= */
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

    // 🔥 Generate Course ID (Institute jaisa)
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
      courseId,
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
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ================= GET ALL ================= */
router.get("/all", async (req, res) => {
  try {
    const courses = await Courses.find().sort({ createdAt: -1 });

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
      faculty: course.faculty,
      duration: course.duration,
      progress: course.progress,
      maxSeats: course.maxSeats,
      nextBatch: course.nextBatch,
      description: course.description,
      subjects: course.subjects
    }));

    res.status(200).json({
      success: true,
      courses: courseData
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ================= GET SINGLE ================= */
router.get("/course/:courseId", async (req, res) => {
  try {
    const course = await Courses.findOne({
      courseId: req.params.courseId
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      course
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ================= UPDATE ================= */
router.put("/updateCourse/:courseId", async (req, res) => {
  try {
    const updatedCourse = await Courses.findOneAndUpdate(
      { courseId: req.params.courseId },
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
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ================= ASSIGN TEACHER ================= */
router.put("/assignTeacher/:courseId", async (req, res) => {
  try {
    const { facultyName } = req.body;

    if (!facultyName) {
      return res.status(400).json({
        success: false,
        message: "Teacher name is required"
      });
    }

    const updatedCourse = await Courses.findOneAndUpdate(
      { courseId: req.params.courseId },
      { $set: { faculty: facultyName } },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
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

/* ================= DELETE ================= */
router.delete("/deleteCourse/:courseId", async (req, res) => {
  try {
    const deletedCourse = await Courses.findOneAndDelete({
      courseId: req.params.courseId
    });

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