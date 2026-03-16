const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const superadmin = require("../model/SuperAdmin")
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const sendOtp=require('../utils/sendOtp');
// const otpHandler = require("../routes/otpRoutes");




// mongoose.connect(process.env.MONGO_URI)
// .then(() => {
//   console.log("MongoDB connected")
// }).catch(err => console.log(err))


// router.use("/otp", otpHandler(superadmin));


router.post("/signup",async(req,res)=>{
    const {name,email,password,lastLogin,isActive} = req.body;

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


router.post("/forget-password", async (req,res)=>{
    const {email}=req.body;
    const user=await superadmin.findOne({email});
    if(!user)
        return res.json({message:"Email not found"});
    const otp=Math.floor(100000 + Math.random()*900000);
  
  const otpExpire = Date.now() + 2 * 60 * 1000;
  const resetExpire = Date.now() + 10 * 60 * 1000;

    user.otp=otp;
    user.otpExpire=otpExpire;
    user.resetSessionExpire=resetExpire;
    await user.save();
    await sendOtp(email,otp);
    res.json({message:"OTP SENT TO YOUR EMAIL PLEASE CHECK IT"});
});

router.post("/verify-otp", async(req,res)=>{
    const {email,otp}=req.body;
    const user=await superadmin.findOne({email});
    if(!user)
        return res.json({message:"USer not Found"});
    if(user.otp!=otp)
        return res.json({message:"Invalid otp"});
    if(user.otpExpire < Date.now())
        return res.json({message:"OTP EXpired"});
    res.json({message:"OTP VERIFIED"});
});
router.post("/reset-password", async(req,res)=>{
    const{email,password}=req.body;
    const user=await superadmin.findOne({email});
    if(!user)
        return res.json({message:"user not found"});
    if(user.resetSessionExpire < Date.now())
        return res.json({message:"session expired"})
    const hash=await bcrypt.hash(password,10);
    user.password=hash;
    user.otp=null;
    user.otpExpire=null;
    await user.save();
    res.json({message:"Password RESET SUccessfully"});
});



const verifyToken = (req, res, next) => {
  const token = req.session.token

  if (!token) {
    return res.status(401).json({ message: "Please login first" });
  }

  jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid session" });
    }
    req.Sadmin = decoded;
    next();
  });
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body
  const Sadmin = await superadmin.findOne({
  email: { $regex: `^${email}$` }})


  if (!Sadmin) {
    return res.status(404).json({ message: "User not found" })
  }

  
  const passwordMatch = await bcrypt.compare(password,Sadmin.password);
  console.log(passwordMatch)
  console.log("abdfn")


  if (!passwordMatch)
    return res.status(200).json({ message: "Invalid password",Success:false });
   
  const token = jwt.sign({ email: Sadmin.email }, "secret", { expiresIn: "1h" } );

  req.session.token = token;
 
 
  console.log(token);
  console.log(Sadmin);

res.status(200).json({
      message: "Login successfully" ,
      Success:true,
      data:{ Name: Sadmin.name,
        Email: Sadmin.email,
        Role:Sadmin.role,
        LastLoginTime:Sadmin.lastLogin


        
      }
    });
  
})

module.exports = router;


//  https://bamcerp.com/register_student.php

