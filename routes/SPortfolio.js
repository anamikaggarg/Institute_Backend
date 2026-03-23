const express = require("express");
const router = express.Router();
const Portfolio = require("../model/studentPortfolio");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ===================== UPLOAD FOLDER ===================== */
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===================== MULTER CONFIG ===================== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, PDF files allowed"));
  }
};

const upload = multer({ storage, fileFilter });

/* ===================== ROUTES ===================== */

/* ✅ CREATE PORTFOLIO */
router.post(
  "/create",
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "addharImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = req.body;

      // 🔍 DEBUG (optional)
      console.log("BODY:", data);
      console.log("FILES:", req.files);

      /* ===================== JSON PARSE ===================== */
      if (data.interests) {
        try {
          data.interests = JSON.parse(data.interests);
        } catch {
          data.interests = [];
        }
      }

      if (data.achievements) {
        try {
          data.achievements = JSON.parse(data.achievements);
        } catch {
          data.achievements = [];
        }
      }

      /* ===================== FILES ===================== */
      if (req.files?.profileImg) {
        data.profileImg = req.files.profileImg[0].filename;
      }

      if (req.files?.addharImage) {
        data.addharImage = req.files.addharImage[0].filename;
      }

      /* ===================== VALIDATION ===================== */
      if (!data.email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      /* ===================== DUPLICATE CHECK ===================== */
      const existing = await Portfolio.findOne({ email: data.email });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Portfolio already exists with this email",
        });
      }

      /* ===================== CREATE ===================== */
      const newPortfolio = await Portfolio.create(data);

      res.status(201).json({
        success: true,
        message: "Portfolio created successfully",
        data: newPortfolio,
      });

    } catch (err) {
      console.log("ERROR:", err); // 👈 VERY IMPORTANT
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/* ✅ GET ALL */
router.get("/all", async (req, res) => {
  try {
    const data = await Portfolio.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ✅ GET BY ID */
router.get("/:id", async (req, res) => {
  try {
    const data = await Portfolio.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ✅ DELETE */
router.delete("/:id", async (req, res) => {
  try {
    const data = await Portfolio.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // delete profile image
    if (data.profileImg) {
      const profilePath = path.join(uploadDir, data.profileImg);
      if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
    }

    // delete aadhar
    if (data.addharImage) {
      const aadharPath = path.join(uploadDir, data.addharImage);
      if (fs.existsSync(aadharPath)) fs.unlinkSync(aadharPath);
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