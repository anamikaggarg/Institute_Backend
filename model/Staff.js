const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  // --- Institute Info (Multi-tenant support) ---
  InstituteId: { type: String, required: true, index: true },
  InstituteName: { type: String, required: true },

  // --- Basic Details ---
  firstName: { type: String, required: true },
  middleName: { type: String },
  LastName: { type: String },
  EmployeeId: { type: String, required: true, unique: true },
  UserRole: { type: String, required: true }, // Teacher, Admin, etc.
  Email: { type: String },
  ContactNumber: { type: String, required: true },
  Gender: { type: String },
  Dob: { type: Date },
  BloodGroup: { type: String },

  // --- Employment Details ---
  JobTitle: { type: String },
  Designation: { type: String },
  Department: { type: String },
  EmploymentType: { type: String },
  AppointmentDate: { type: Date },
  ExperienceYears: { type: String },
  HighestQualification: { type: String },
  UAN: { type: String },
  PFAccountNumber: { type: String },
  ESICode: { type: String },
  ReportingManager: { type: String },
  Reportee: { type: String },

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

  // --- Address Details ---
  Address: { type: String },
  State: { type: String },
  Country: { type: String },

  // --- Previous Experience ---
  PrevInstituteName: { type: String },
  PrevJobTitle: { type: String },
  PrevJoiningDate: { type: Date },

  // --- System Fields ---
  photoUrl: { type: String }, // Image upload ke liye
  status: { type: String, default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);