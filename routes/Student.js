const express = require("express");
const router = express.Router();
const Student = require("../model/Student");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpHandler = require("../routes/otpRoutes");



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "student-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Attach OTP routes for Student
router.use("/otp", otpHandler(Student));




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

    const generateStudentId = async () => {
      let uniqueId;
      let exists = true;

      while (exists) {
        const randomNumber = Math.floor(10000 + Math.random() * 9000);
        uniqueId = `STU-${randomNumber}`;
        exists = await Student.findOne({ studentID: uniqueId });
      }

      return uniqueId;
    };

    const studentID = await generateStudentId();

    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.status(409).json({
        message: "Student already registered with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      studentID,
      fullName,
      email,
      password: hashedPassword,
      dob,
      contactNo,
      course,
      instituteName,
      address,
      status,
      profileImage: req.file ? req.file.filename : null,
    });

    await newStudent.save();

    res.status(201).json({
      success: true,
      message: "Student successfully registered",
      student: newStudent,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




const verifyToken = (req, res, next) => {
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({
      message: "Please login first",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    req.student = decoded;
    next();
  });
};



router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        success: false,
      });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid password",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        studentID: student.studentID,
        email: student.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    req.session.token = token;

    res.status(200).json({
      message: "Login successfully",
      success: true,
      token: token,
      student: student,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const student = await Student.findOne({
      email: req.student.email,
    });

    res.status(200).json({
      success: true,
      student: student,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.get("/allStudents", async (req, res) => {
  try {
    const students = await Student.find();

    if (students.length === 0) {
      return res.status(404).json({
        message: "No students found",
      });
    }

    res.status(200).json({
      message: "All students",
      students: students,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});



router.put("/updateStudent/:studentID", async (req, res) => {
  try {
    const student = await Student.findOne({
      studentID: req.params.studentID,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    student.fullName = req.body.fullName || student.fullName;
    student.email = req.body.email || student.email;
    student.dob = req.body.dob || student.dob;
    student.contactNo = req.body.contactNo || student.contactNo;
    student.course = req.body.course || student.course;
    student.instituteName =
      req.body.instituteName || student.instituteName;
    student.address = req.body.address || student.address;
    student.status = req.body.status || student.status;

    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      student.password = hashedPassword;
    }

    await student.save();

    res.json({
      message: "Student updated successfully",
      student: student,
      
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});



router.post("/logout", (req, res) => {
  try {
    if (req.session) {
      req.session.destroy(() => {});
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});


module.exports = router;