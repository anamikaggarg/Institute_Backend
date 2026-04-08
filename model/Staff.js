const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
 
   staffId: {
    type: String,
    unique: true
  },
  firstName: { type: String, required: true },
  middleName: { type: String },
  LastName: { type: String },
  EmployeeId: { type: String, required: true, unique: true },

  Email: { type: String },
   password: {            
    type: String,
    
  },
  role: {
  type: String,
  default: "staff"
},
  ContactNumber: { type: String, required: true },
  Gender: { type: String },
  Dob: { type: String }, 

  UserRole: {
  type: String,
  required: true,
  enum: ["Teacher", "Receptionist", "Accountant"],
  default: "student"
},

assignedClasses:[
  {type:String}
],

  JobTitle: { type: String },
  Designation: { type: String },
  Department: { type: String },
  EmploymentType: { type: String },
  AppointmentDate: { type: String },

 
  AadharNumber: { type: String },
  PANNumber: { type: String },
  FatherName: { type: String },
  MotherName: { type: String },
  Religion: { type: String },
  Category: { type: String },
  MaritalStatus: { type: String },
  SpouseName: { type: String },
  EmergencyContact: { type: String },

 
  BankName: { type: String },
  BankAccountNumber: { type: String },
  IFSC: { type: String },
  AccountHolder: { type: String },

 
  experience: [
    {
      PrevInstituteName: { type: String },
      PrevJobTitle: { type: String },
      PrevJoiningDate: { type: String }
    }
  ],


  status: { type: String, default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);