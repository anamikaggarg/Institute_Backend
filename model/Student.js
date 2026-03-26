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

    dob: {
      type: String,
      required: true,
    },

    contactNo: String,
    course: String,

    instituteName: {
      type: String,
      required: true,
    },

    instituteId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Institute",
},
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
