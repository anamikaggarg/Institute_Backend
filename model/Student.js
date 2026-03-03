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

    address: String,

    profileImage: String,

    role: {
      type: String,
      default: "student",
    },
     status: { type: String,  default: "Active" },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Student", studentSchema);
