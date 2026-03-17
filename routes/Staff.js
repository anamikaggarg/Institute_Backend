const express = require("express");
const router = express.Router();
const Staff = require("../model/Staff");


router.post("/addStaff", async (req, res) => {
  try {
    // Spreed operator (...) use karne se saari fields jo frontend se aa rahi hain automatic map ho jayengi
    const newStaff = new Staff({
      ...req.body 
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
    // Sort by newest first
    const staff = await Staff.find().sort({ createdAt: -1 });

    if (!staff || staff.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No staff found"
      });
    }

    res.status(200).json({
      success: true,
      count: staff.length,
      staff
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. SEARCH BY EMAIL
router.get("/search/:email", async (req, res) => {
  try {
    const { email } = req.params;
    // Schema mein field ka naam 'Email' (Capital E) hai ya 'email', ye check kar lena
    const staff = await Staff.findOne({ Email: email }); 

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: updatedStaff
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// --- GET STAFF BY EMPLOYEE ID ---
router.get("/getStaffByEmpId/:empId", async (req, res) => {
  try {
    const { empId } = req.params;
    
    // Database mein 'EmployeeId' field se search karein
    const staff = await Staff.findOne({ EmployeeId: empId }); 

    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: "Staff member not found with this Employee ID" 
      });
    }

    res.status(200).json({ 
      success: true, 
      staff 
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. DELETE STAFF
router.delete("/deleteStaff/:id", async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);

    if (!deletedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({
      success: true,
      message: "Staff deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;