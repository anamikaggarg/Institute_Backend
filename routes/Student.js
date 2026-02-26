const express = require("express");
const router = express.Router();
const Student = require("../model/Student");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    ),
});

const upload = multer({ storage });


router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      dob,
      contactNo,
      course,
      instituteName,
      address,
      status,
    } = req.body;

    if (!fullName || !email || !password || !dob || !instituteName) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const studentID = "STU-" + fullName.slice(0, 4) + "-" + Date.now();

    const studentDoc = {
      studentID,
      fullName,
      email,
      password: hashedPassword, 
      dob,
      contactNo: contactNo || "",
      course: course || "",
      instituteName,
      address: address || "",
      status: status || "Active",
      profileImage: req.file ? req.file.filename : "",
    };

    await Student.collection.insertOne(studentDoc);

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      studentID,
    });
  } catch (err) {
    console.error("REGISTER ERROR 👉", err);
    res.status(500).json({
      success: false,
      message:
        err.code === 11000
          ? "Email already exists"
          : "Student registration failed",
    });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      student: {
        studentID: student.studentID,
        fullName: student.fullName,
        email: student.email,
        course: student.course,
        instituteName: student.instituteName,
        status: student.status,
        profileImage: student.profileImage,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR ", err);
    res.status(500).json({
      success: false,
      message: "Student login failed",
    });
  }
});




router.get("/all", async (req, res) => {
  try {
    const students = await Student.find()
      .select("-_id -password -__v")
      .lean();
    res.json({ message: "All students", students });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
