const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema({
  instituteId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  alternatePhone: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  registeredDate: {
    type: Date,
    default: Date.now
  },
  numberOfStudents: {
    type: Number
  },
  aadhaarNumber: {
    type: String
  },
  gstNumber: {
    type: String
  },
  courses: {
    type: [String] 
  },
  logo: {
    type: String 
  },
  status: {
    type: String,
    default: "pending" 
  },
   createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Institute", instituteSchema);
