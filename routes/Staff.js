const express = require("express");
const router = express.Router();
const Staff = require("../model/Staff");
const Institute = require("../model/Institute"); // Add institute model
const bcrypt = require("bcryptjs"); // For password hashing

// 1. ADD STAFF WITH DUPLICATE CHECK
router.post("/addStaff", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if email already exists in Institute
    const inInstitute = await Institute.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
    if (inInstitute) {
      return res.status(400).json({
        success: false,
        message: "Email already registered as Institute. Cannot add as Staff."
      });
    }

    // Check if email already exists in Staff
    const inStaff = await Staff.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
    if (inStaff) {
      return res.status(400).json({
        success: false,
        message: "Email already registered as Staff."
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new Staff({
      email,
      password: hashedPassword,
      name,
      ...req.body // map any other fields from frontend
    });

    await newStaff.save();

    res.status(201).json({
      success: true,
      message: "Staff member added successfully",
      staff: newStaff
    });
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 2. GET ALL STAFF
router.get("/allStaff", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    if (!staff || staff.length === 0) {
      return res.status(404).json({ success: false, message: "No staff found" });
    }

    res.status(200).json({ success: true, count: staff.length, staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. SEARCH BY EMAIL
router.get("/search/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const staff = await Staff.findOne({ email }); // Use correct field name 'email'

    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. UPDATE STAFF
router.put("/updateStaff/:id", async (req, res) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedStaff) return res.status(404).json({ success: false, message: "Staff not found" });

    res.status(200).json({ success: true, message: "Staff updated successfully", data: updatedStaff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET STAFF BY EMPLOYEE ID
router.get("/getStaffByEmpId/:empId", async (req, res) => {
  try {
    const { empId } = req.params;
    const staff = await Staff.findOne({ EmployeeId: empId });

    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found with this Employee ID" });

    res.status(200).json({ success: true, staff });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. DELETE STAFF
router.delete("/deleteStaff/:id", async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) return res.status(404).json({ success: false, message: "Staff not found" });

    res.status(200).json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;