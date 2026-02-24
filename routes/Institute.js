const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Institute = require("../model/Institute");
const path = require('path');
const multer = require('multer');
const jwt = require("jsonwebtoken");


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
    const institute = await Institute.findOne({ instituteId: req.params.instituteId });

    if (!institute) {
      return res.status(404).send("Institute not found");
    }

    institute.contact = req.body.contact || institute.contact;
    institute.city = req.body.city || institute.city;
    institute.address = req.body.address || institute.address;
    institute.numberOfStudents =
      req.body.numberOfStudents || institute.numberOfStudents;

    await institute.save();

    res.json({
      message: "Institute updated successfully"
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});

const verifyToken = (req,res,next) =>{
  const token = req.session.token

  if(!token){
    return res.status(401).json({message:"Please login first"});
  }
  jwt.verify(token,"secret",(err,decoded)=>{
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
      { expiresIn: "1h" }
    );

    req.session.token = token;
    console.log(token);

    res.status(200).json({
      message: "Login successfully",
      success: true,
      institute: {
        instituteId: institute.instituteId,
        name: institute.name,
        email: institute.email
      }
    });
   


  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.get("/dashboard", verifyToken, async (req, res) => {

  const user = await Institute.findOne({ email: req.user.email });
  
  res.render("user", {
    username: user.username,
    email: user.email
  });
});


router.get("/logout", (req, res) => {
  res.clearCookie("token");       
  res.redirect("/login");
});

module.exports = router;
