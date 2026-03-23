const express = require("express");
const router = express.Router();
const Courses = require("../model/courseModal"); // ✅ rename model

/* ===================== CREATE COURSE ===================== */
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

/* ===================== GET ALL COURSES ===================== */
router.get("/all", async (req, res) => {
  try {
    const courses = await Courses.find().sort({ createdAt: -1 });

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found"
      });
    }

    res.status(200).json({
      success: true,
      message: "All courses fetched",
      courses: courses
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===================== GET SINGLE COURSE ===================== */
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

/* ===================== UPDATE COURSE ===================== */
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