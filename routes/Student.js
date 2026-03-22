const express = require("express");
const router = express.Router();
const Student = require("../model/Student");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOtp = require('../utils/sendOtp');
// const otpHandler = require("../routes/otpRoutes");



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


// router.use("/otp", otpHandler(Student));




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
      parentName,
      parentContactNo,
      parentOccupation,
      parentRelation
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
      parent: {
        name: parentName,
        contactNo: parentContactNo,
        occupation: parentOccupation,
        relation: parentRelation,
      },
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

router.post("/forget-password", async (req, res) => {
  const { email } = req.body;
  const user = await Student.findOne({ email });
  if (!user)
    return res.json({ message: "Email not found" });
  const otp = Math.floor(100000 + Math.random() * 900000);

  const otpExpire = Date.now() + 2 * 60 * 1000;

  user.otp = otp;
  user.otpExpire = otpExpire;

  await user.save();
  await sendOtp(email, otp);
  res.json({ message: "OTP SENT TO YOUR EMAIL PLEASE CHECK IT" });
});


router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await Student.findOne({ email });
  if (!user)
    return res.json({ success: false, message: "User not found" });
  if (user.otp !== Number(otp))
    return res.json({ success: false, message: "Invalid OTP" });

  if (user.otpExpire < Date.now())
    return res.json({ success: false, message: "OTP expired" });

  const token = jwt.sign(
    { useremail: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );

  user.resetToken = token;



  user.otp = null;
  user.otpExpire = null;


  await user.save();

  res.json({
    success: true,
    message: "OTP Verified",
  });
});


router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  let decoded;
  const user = await Student.findOne({ email });
  try {

    decoded = jwt.verify(user.resetToken, process.env.JWT_SECRET);

  } catch (err) {
    return res.json({ success: false, message: " expired token" });
  }

  const hash = await bcrypt.hash(password, 10);

  user.password = hash;
  user.resetToken = null;
  await user.save();

  res.json({ success: true, message: "Password reset successfully" });
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

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password, parentContactNo, dob } = req.body;

    let student;
    let role = "";

    // ===== STUDENT LOGIN =====
    if (email && password) {
      student = await Student.findOne({
        email: { $regex: `^${email}$`, $options: "i" },
      });

      if (!student)
        return res.status(404).json({ message: "Student not found" });

      const match = await bcrypt.compare(password, student.password);
      if (!match)
        return res.status(401).json({ message: "Invalid password" });

      role = "student";
    }

    // ===== PARENT LOGIN =====
    else if (parentContactNo && dob) {
      student = await Student.findOne({
        "parent.contactNo": parentContactNo,
        dob: dob, // IMPORTANT FIX
      });

      if (!student)
        return res.status(404).json({
          message: "Parent not found or wrong details",
        });

      role = "parent";
    }

    else {
      return res.status(400).json({
        message: "Provide email+password OR parentContactNo+dob",
      });
    }

    const token = jwt.sign(
      {
        studentID: student.studentID,
        role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      role,
      token,
      student,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SEPARATE PARENT LOGIN =================
router.post("/parent-login", async (req, res) => {
  try {
    const { contactNo, dob } = req.body;

    const student = await Student.findOne({
      "parent.contactNo": contactNo,
      dob: dob, // FIXED
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid details",
      });
    }

    const token = jwt.sign(
      {
        studentID: student.studentID,
        role: "parent",
        parentName: student.parent.name, // FIXED
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Parent login successful",
      token,
      student,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      req.session.destroy(() => { });
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