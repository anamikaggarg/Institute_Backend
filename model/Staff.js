const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  // --- Basic Details ---
  firstName: { type: String, required: true },
  middleName: { type: String },
  LastName: { type: String },
  EmployeeId: { type: String, required: true, unique: true },
  UserRole: { type: String, required: true },
  Email: { type: String },
  ContactNumber: { type: String, required: true },
  Gender: { type: String },
  Dob: { type: String }, // Date string format handle karne ke liye String rakha h

  // --- Employment Details ---
  JobTitle: { type: String },
  Designation: { type: String },
  Department: { type: String },
  EmploymentType: { type: String },
  AppointmentDate: { type: String },

  // --- Additional Details ---
  AadharNumber: { type: String },
  PANNumber: { type: String },
  FatherName: { type: String },
  MotherName: { type: String },
  Religion: { type: String },
  Category: { type: String },
  MaritalStatus: { type: String },
  SpouseName: { type: String },
  EmergencyContact: { type: String },

  // --- Bank Details (Aapke frontend mein h isliye yahan add kiya) ---
  BankName: { type: String },
  BankAccountNumber: { type: String },
  IFSC: { type: String },
  AccountHolder: { type: String },

  // --- Experience (ARRAY FORMAT - CRITICAL FIX) ---
  experience: [
    {
      PrevInstituteName: { type: String },
      PrevJobTitle: { type: String },
      PrevJoiningDate: { type: String }
    }
  ],

  // --- System Fields ---
  status: { type: String, default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);