const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const superadmin = require("../model/SuperAdmin")
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const sendOtp = require('../utils/sendOtp');
// const otpHandler = require("../routes/otpRoutes");




// mongoose.connect(process.env.MONGO_URI)
// .then(() => {
//   console.log("MongoDB connected")
// }).catch(err => console.log(err))


// router.use("/otp", otpHandler(superadmin));


router.post("/signup", async (req, res) => {
  const { name, email, password, lastLogin, isActive } = req.body;

  const existingSAdmin = await superadmin.findOne({ email })
  if (existingSAdmin) {
    return res.status(400).json({ message: "Email already registered" })
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = new superadmin({
    name,
    email,
    password: hashedPassword,
    lastLogin,
    isActive

  })

  await newAdmin.save()

  res.status(201).json({
    message: " successfully registered",

  })

})


router.post("/forget-password", async (req, res) => {
  const { email } = req.body;
  const user = await superadmin.findOne({ email });
  if (!user)
    return res.json({ success: false, message: "Email not found" });
  const otp = Math.floor(100000 + Math.random() * 900000);

  const otpExpire = Date.now() + 2 * 60 * 1000;

  user.otp = otp;
  user.otpExpire = otpExpire;
  await user.save();
  await sendOtp(email, otp);
  res.json({ success: true, message: "OTP SENT TO YOUR EMAIL PLEASE CHECK IT" });
});


router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await superadmin.findOne({ email });
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
    message: "OTP Verified"
  });
});

router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  let decoded;
  const user = await SuperAdmin.findOne({ email });
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
  const token = req.session.token

  if (!token) {
    return res.status(401).json({ success: false, message: "Please login first" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Invalid session" });
    }
    req.Sadmin = decoded;
    next();
  });
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body
  console.log(email);
  const Sadmin = await superadmin.findOne({
    email: { $regex: `^${email}$`}
  })
  console.log(Sadmin)


  if (!Sadmin) {
    return res.status(404).json({ success: false, message: "User not found" })
  }


  const passwordMatch = await bcrypt.compare(password, Sadmin.password);
  console.log(passwordMatch)
  console.log("abdfn")


  if (!passwordMatch)
    return res.status(200).json({ message: "Invalid password", Success: false });

  const token = jwt.sign({ email: Sadmin.email }, "secret", { expiresIn: "1h" });

  req.session.token = token;


  console.log(token);
  console.log(Sadmin);

  res.status(200).json({
    message: "Login successfully",
    success: true,
    data: {
      Name: Sadmin.name,
      Email: Sadmin.email,
      Role: Sadmin.role,
      LastLoginTime: Sadmin.lastLogin



    }
  });

})

module.exports = router;


//  https://bamcerp.com/register_student.php