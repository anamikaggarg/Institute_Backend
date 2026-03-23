const express = require("express");
const router = express.Router();
const Portfolio = require("../model/studentPortfolio");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Make sure uploads folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "student-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// CREATE Portfolio
router.post(
  "/create",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "addharImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = req.body;

      // Attach uploaded files
      if (req.files["avatar"]) {
        data.avatar = req.files["avatar"][0].filename;
      }
      if (req.files["addharImage"]) {
        data.addharImage = req.files["addharImage"][0].filename;
      }

      // Check for existing portfolio by email
      if (!data.email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const existingStudent = await Portfolio.findOne({ email: data.email });
      if (existingStudent) {
        return res.status(409).json({
          message: "Student Portfolio already exists with this email",
        });
      }

      const newPortfolio = await Portfolio.create(data);

      res.status(201).json({
        success: true,
        message: "Portfolio saved successfully",
        data: newPortfolio,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message,
      });
    }
  }
);

// GET all portfolios
router.get("/all", async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: portfolios,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single portfolio by ID
router.get("/:id", async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    res.json({
      success: true,
      data: portfolio,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE portfolio by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Portfolio.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;