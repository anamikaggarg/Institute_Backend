const express = require("express");
const router = express.Router();
const Staff = require("../model/Staff");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


router.post("/addStaff", async (req, res) => {
  try {

    console.log("BODY DATA:", req.body);

    const newStaff = new Staff({
      InstituteId: req.body.InstituteId,
      InstituteName: req.body.InstituteName,
      ReferenceName: req.body.ReferenceName,
      firstName: req.body.firstName,
      LastName: req.body.LastName,
      UserRole: req.body.UserRole,
      ContactNumber: req.body.ContactNumber,
      AadharNumber: req.body.AadharNumber,
      PanNumber: req.body.PanNumber,
      FathersName: req.body.FathersName,
      MothersName: req.body.MothersName,
      AppointmentDate: req.body.AppointmentDate,
      HighestQualification: req.body.HighestQualification,
      ESI: req.body.ESI,
      Country: req.body.Country,
      State: req.body.State,
      Address: req.body.Address,
      Gender: req.body.Gender,
      BloodGroup: req.body.BloodGroup,
      Dob: req.body.Dob
    });

    await newStaff.save();

    res.status(201).json({
      success: true,
      message: "Staff added successfully",
      staff: newStaff
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});



router.get("/allStaff", async (req, res) => {
  try {

    const staff = await Staff.find();

    if (staff.length === 0) {
      return res.status(404).json({
        message: "No staff found"
      });
    }

    res.status(200).json({
      message: "All staff",
      staff
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});



router.get("/search/:email", async (req, res) => {
  try {

    const email = req.params.email;

    const staff = await Staff.findOne({ email });

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    res.status(200).json({
      message: "Staff found",
      staff
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});



router.put("/updateStaff/:id", async (req, res) => {
  try {

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    res.status(200).json({
      message: "Staff updated successfully",
      data: updatedStaff
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});



router.delete("/deleteStaff/:id", async (req, res) => {
  try {

    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);

    if (!deletedStaff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    res.status(200).json({
      message: "Staff deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});

module.exports = router;