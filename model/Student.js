const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    studentID: {
      type: String,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      default: null
    },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED"],
      default: "PENDING"
    },





    dob: {
      type: String,
      required: true,
    },

    contactNo: String,

    instituteName: {
      type: String,
      required: true,
    },

    instituteId: [
        { type: String }
  
    ],
parent: {
  name: String,
    contactNo: String,
      occupation: String,
        relation: String,
    },
otp: { type: Number, default: null },
otpExpire: { type: Number, default: null },


address: String,


  profileImage: String,

    resetToken: {
  type: String,
      default: null
},


role: {
  type: String,
      default: "student",
    },
status: { type: String,  default: "Active" },
  },
{ timestamps: true }

);


module.exports = mongoose.model("Student", studentSchema);
