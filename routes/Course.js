const express = require("express");
const router = express.Router();
const Courses = require("../model/courseModal");

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

/* ================= GET ALL ================= */
router.get("/all", async (req, res) => {
  try {
    const courses = await Courses.find().sort({ createdAt: -1 });
    // Yahan seedha courses bhej do, manual mapping ki zaroorat nahi agar aapko saare fields chahiye
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ================= GET SINGLE ================= */
router.get("/course/:courseId", async (req, res) => {
  try {
    const course = await Courses.findOne({ courseId: req.params.courseId });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ================= UPDATE COURSE (Universal) ================= */
// Ye route subjects, teacher, ya description—kuch bhi update kar dega
router.put("/updateCourse/:courseId", async (req, res) => {
  try {
    const updatedCourse = await Courses.findOneAndUpdate(
      { courseId: req.params.courseId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) return res.status(404).json({ success: false, message: "Course not found" });

    res.status(200).json({ success: true, message: "Updated successfully", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ================= REMOVE TEACHER (Specific) ================= */
// Isse aap frontend par 'Remove' button click karne par use kar sakte ho
router.put("/removeTeacher/:courseId", async (req, res) => {
  try {
    const updatedCourse = await Courses.findOneAndUpdate(
      { courseId: req.params.courseId },
      { $set: { classTeacher: null } }, // Teacher field ko clear kar dega
      { new: true }
    );
    res.status(200).json({ success: true, message: "Teacher removed", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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