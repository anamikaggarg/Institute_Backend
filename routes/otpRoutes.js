const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const sendOtp = require("../utils/sendOtp");


const otpHandler = (Model) => {
  
  router.post("/forget-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Model.findOne({ email });
      console.log("Body:", req.body);
console.log("Email:", email);
      if (!user) return res.status(404).json({ message: "Email not found" });

      const otp = Math.floor(100000 + Math.random() * 900000);
      user.otp = otp;
      user.otpExpire = Date.now() + 2 * 60 * 1000;       // 2 min
      user.resetSessionExpire = Date.now() + 10 * 60 * 1000; // 10 min
      await user.save();

      await sendOtp(email, otp);
      res.json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  
  router.post("/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await Model.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.otp != otp) return res.json({ message: "Invalid OTP" });
      if (user.otpExpire < Date.now()) return res.json({ message: "OTP expired" });
      res.json({ success: true, message: "OTP verified" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


  router.post("/reset-password", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Model.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.resetSessionExpire < Date.now()) return res.json({ message: "Session expired" });

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.otp = null;
      user.otpExpire = null;
      user.resetSessionExpire = null;
      await user.save();

      res.json({ success: true, message: "Password reset successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};

module.exports = otpHandler;