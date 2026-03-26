const express = require("express");
const router = express.Router();
const Courses = require("../model/courseModal");


router.post("/create", async (req, res) => {
  try {
    const { name, duration, description, subjects, sections, instituteId } = req.body;

    
    if (!instituteId) {
      return res.status(400).json({ success: false, message: "Institute ID is required" });
    }

    
    const generateCourseId = async () => {
      let uniqueId;
      let exists = true;
      while (exists) {
        const randomNumber = Math.floor(10000 + Math.random() * 90000);
        uniqueId = `CRS-${randomNumber}`;
        exists = await Courses.findOne({ courseId: uniqueId });
      }
      return uniqueId;
    };

    const courseId = await generateCourseId();

    const newCourse = new Courses({
      courseId,
      instituteId, 
      name,
      duration,
      description,
      subjects: subjects || [],
      sections: sections || ["A"],
      status: "Active" 
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


router.get("/all", async (req, res) => {
  try {
    const { instituteId } = req.query; 

    if (!instituteId) {
      return res.status(400).json({ success: false, message: "Institute ID missing" });
    }

    // Sirf usi institute ke courses dikhao
    const courses = await Courses.find({ instituteId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      courses: courses
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get("/course/:courseId", async (req, res) => {
  try {
    const course = await Courses.findOne({ courseId: req.params.courseId });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/updateCourse/:courseId", async (req, res) => {
  try {
    const updatedCourse = await Courses.findOneAndUpdate(
      { courseId: req.params.courseId },
      { $set: req.body }, 
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
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


router.delete("/deleteCourse/:courseId", async (req, res) => {
  try {
    const deletedCourse = await Courses.findOneAndDelete({
      courseId: req.params.courseId
    });

    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
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