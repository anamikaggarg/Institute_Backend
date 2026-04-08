const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Institute = require("../model/Institute");
const path = require('path');
const multer = require('multer');
const jwt = require("jsonwebtoken");
const sendOtp = require("../utils/sendOtp");
const Student = require("../model/Student")
const Staff = require("../model/Staff"); 


const storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,'uploads/');
  },
  filename: function(req,file,cb){
     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));

  }
})
const upload = multer({storage});



router.post("/register",upload.single('logo'), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      contact,
      city,
      registeredDate,
      numberOfStudents,
      address,
      aadhaarNumber,
      alternatePhone,logo,courses,status,gstNumber
    } = req.body;

    const generateInstituteId = async()=>{
      let uniqueId;
      let exists = true;
      while(exists){
        const randomNumber = Math.floor(10000 + Math.random() * 9000);
        uniqueId = `INS-${randomNumber}`;

        exists = await Institute.findOne({instituteId : uniqueId});
      }
      return uniqueId;
    }
     const instituteId = await generateInstituteId();

    const existingInstitute = await Institute.findOne({
      $or: [{ email }, { instituteId }]
    });

    if (existingInstitute) {
      return res.status(409).json({
        message: "Institute already registered with this email or instituteId"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newInstitute = new Institute({
      instituteId, 
      name,
      email,
      password: hashedPassword,
      contact,
      city,
      registeredDate: registeredDate || new Date(),
      numberOfStudents,
      address,
      aadhaarNumber,
      alternatePhone,
       logo: req.file ? req.file.filename : null, 
      courses,status,
      gstNumber
    });

    await newInstitute.save();

    res.status(201).json({
      success:true,
      message: "Institute successfully registered",
      institute: {
        instituteId,
        name,
        email,
        contact,
        city,
        registeredDate,
        numberOfStudents,
        address,
        aadhaarNumber,
        alternatePhone,
         logo: req.file ? req.file.filename : null,
        courses,status,
        gstNumber
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/allInstitute", async (req, res) => {
  try {
    const institutes = await Institute.find();

    if (institutes.length === 0) {
      return res.status(404).json({ message: "No institutes found" });
    }

    const instituteData = institutes.map(inst => ({
      instituteId: inst.instituteId,
      name: inst.name,
      email: inst.email,
      contact: inst.contact,
      city: inst.city,
      registeredDate: inst.registeredDate,
      numberOfStudents: inst.numberOfStudents,
      address: inst.address,
      aadhaarNumber: inst.aadhaarNumber,
      alternatePhone: inst.alternatePhone,
      logo: inst.logo,
      courses:inst.courses,
      gstNumber: inst.gstNumber,
      status:inst.status
    }));

    res.status(200).json({
      message: "All institutes ",
      institutes: instituteData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/search/:instituteId", async (req, res) => {
  try {
    const instituteId = req.params.instituteId;

    const institute = await Institute.findOne({ instituteId });

    if (!institute) {
      return res.status(404).json({
        message: "Institute not found"
      });
    }

    const searchInstitute = {
      instituteId: institute.instituteId, 
      name: institute.name,
      email: institute.email,
      contact: institute.contact,
      city: institute.city,
      registeredDate: institute.registeredDate,
      numberOfStudents: institute.numberOfStudents,
      address: institute.address,
      aadhaarNumber: institute.aadhaarNumber,
      alternatePhone: institute.alternatePhone,
      logo: null
    };

    res.status(200).json({
      message: "Institute found",
      institute: searchInstitute
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/updateInstitute/:instituteId", async (req, res) => {
  try {

    if (!req.body) {
      return res.status(400).json({ message: "No data received" });
    }

    const updatedInstitute = await Institute.findOneAndUpdate(
      { instituteId: req.params.instituteId },
      { $set: req.body }, 
      { new: true }        
    );

    if (!updatedInstitute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    res.json({
      message: "Institute updated successfully",
      data: updatedInstitute
    });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: error.message });
  }
});

const verifyToken = (req,res,next) =>{
  const token = req.session.token

  if(!token){
    return res.status(401).json({message:"Please login first"});
  }
  jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
    if(err){
      return res.status(401).json({message:"Invalid credentials"});

    }
    req.institute = decoded;
    next();
  })
}


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const institute = await Institute.findOne({
      email: { $regex: `^${email}$`, $options: "i" }
    });


    if (!institute) {
      return res.status(404).json({
        message: "Institute not found",
        success: false
      });
    }

    const passwordMatch = await bcrypt.compare(password, institute.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid password",
        success: false
      });
    }

    const token = jwt.sign(
      {
        instituteId: institute.instituteId,
        email: institute.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    req.session.token = token;
       req.session.instituteId = institute.instituteId;
console.log("SESSION AFTER LOGIN:", req.session);
    res.status(200).json({
      message: "Login successfully",
      success: true,
      token: token,
      institute: institute
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     let user = null;
//     let role = "";

   
//     const institute = await Institute.findOne({
//       email: { $regex: `^${email}$`, $options: "i" }
//     });

//     if (institute) {
//       const passwordMatch = await bcrypt.compare(
//         password,
//         institute.password
//       );

//       if (!passwordMatch) {
//         return res.status(401).json({
//           success: false,
//           message: "Invalid password"
//         });
//       }

//       role = "institute";
//       user = institute;

//       const token = jwt.sign(
//         {
//           instituteId: institute.instituteId,
//           email: institute.email,
//           role: role
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: "24h" }
//       );

//       req.session.token = token;
//       req.session.instituteId = institute.instituteId;
//       req.session.role = role;

//       return res.status(200).json({
//         success: true,
//         message: "Institute login successfully",
//         token,
//         role,
//         user
//       });
//     }

//     // =========================
//     // 2. CHECK STAFF
//     // =========================
//     const staff = await Staff.findOne({
//       Email: { $regex: `^${email}$`, $options: "i" }
//     });

//     if (staff) {
//       const passwordMatch = await bcrypt.compare(
//         password,
//         staff.password
//       );

//       if (!passwordMatch) {
//         return res.status(401).json({
//           success: false,
//           message: "Invalid password"
//         });
//       }

//       role = "staff";
//       user = staff;

//       const token = jwt.sign(
//         {
//           staffId: staff.staffId,
//           email: staff.Email,
//           role: role
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: "24h" }
//       );

//       req.session.token = token;
//       req.session.staffId = staff.staffId;
//       req.session.role = role;

//       return res.status(200).json({
//         success: true,
//         message: "Staff login successfully",
//         token,
//         role,
//         user
//       });
//     }

   
//     return res.status(404).json({
//       success: false,
//       message: "User not found"
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });



router.get("/dashboard", verifyToken, async (req, res) => {

  const user = await Institute.findOne({ email: req.user.email });
  
  res.render("user", {
    username: user.username,
    email: user.email
  });
});
router.get("/by-email/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const institute = await Institute.findOne({ email: email });

    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    res.status(200).json({
      instituteId: institute.instituteId,
      name: institute.name,
      email: institute.email,
      contact: institute.contact,
      city: institute.city,
      currentPlan: institute.currentPlan,
      planStatus: institute.planStatus,
      planStartDate: institute.planStartDate,
      planEndDate: institute.planEndDate,
      customFeatures: institute.customFeatures, 
      logo: institute.logo
    });

  } catch (error) {
    console.error("Error fetching institute by email:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// req send to institute

router.post("/update-password", async (req, res) => {
  try {

    const { oldPassword, newPassword } = req.body;

    const token = req.session.token;
    console.log(req.session);

    // if (!token) {
    //   return res.status(401).json({ message: "Please login first" });
    // }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const institute = await Institute.findOne({
      instituteId: decoded.instituteId
    });

    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, institute.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    institute.password = hashedPassword;

    await institute.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});
router.post("/forget-password", async (req, res) => {
  const { email } = req.body;
  const user = await Institute.findOne({ email });
  if (!user) return res.json({ success: false, message: "Email not found" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpire = Date.now() + 2 * 60 * 1000;

  user.otp = otp;
  user.otpExpire = otpExpire;

  // Save without validation
  await user.save({ validateBeforeSave: false });

  await sendOtp(email, otp);
  res.json({ success: true, message: "OTP SENT TO YOUR EMAIL, PLEASE CHECK IT" });
});
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await Institute.findOne({ email });
  if (!user) return res.json({ success: false, message: "User not found" });

  if (user.otp !== Number(otp))
    return res.json({ success: false, message: "Invalid OTP" });

  if (user.otpExpire < Date.now())
    return res.json({ success: false, message: "OTP expired" });

  const token = jwt.sign(
    { useremail: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );

  // Direct update to avoid validation errors
  await Institute.updateOne(
    { email },
    { $set: { resetToken: token, otp: null, otpExpire: null } }
  );

  res.json({
    success: true,
    message: "OTP Verified"
  });
});
 
 router.post("/reset-password", async (req, res) => {
   const { email, password } = req.body;
   let decoded;
   const user = await Institute.findOne({ email });
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

router.put("/approveStudent", async (req, res) => {
  try {
    const { studentId, instituteId } = req.body;

    const student = await Student.findOne({
      studentID: studentId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const institute = await Institute.findOne({
      instituteId,
    });

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    const appliedIndex = student.appliedInstitutes.findIndex(
      (item) => item.instituteId === instituteId
    );

    if (appliedIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Application not found",
      });
    }

    student.appliedInstitutes.forEach((app, index) => {
      if (index === appliedIndex) {
        app.status = "APPROVED";
      } else if (app.status === "PENDING") {
        app.status = "REJECTED";
      }
    });

    student.instituteId = instituteId;
    student.approvalStatus = "APPROVED";

    await student.save();

    await Institute.findOneAndUpdate(
      { instituteId },
      {
        $addToSet: {
          students: {
            studentId,
            status: "APPROVED",
          },
        },
        $inc: { numberOfStudents: 1 },
      }
    );

    res.status(200).json({
      success: true,
      message: "Approved Successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/pending-students/:instituteId", async (req, res) => {
  try {
    const { instituteId } = req.params;

    // Aise students dhundo jinke 'appliedInstitutes' array mein 
    // ye instituteId ho aur status 'PENDING' ho
    const pendingStudents = await Student.find({
      appliedInstitutes: {
        $elemMatch: {
          instituteCode: instituteId, // Agar aap code use kar rahe hain
          status: "PENDING"
        }
      }
    });

    res.json({ success: true, students: pendingStudents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/logout", (req, res) => {
  try {
    if (!req.session) {
      return res.status(200).json({
        success: true,
        message: "Already logged out"
      });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Logout failed"
        });
      }

      res.clearCookie("connect.sid"); // session cookie

      return res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
module.exports = router;
