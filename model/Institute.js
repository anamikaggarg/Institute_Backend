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
  alternatePhone: String,
  city: {
    type: String,
    required: true
  },
  address: String,
  registeredDate: {
    type: Date,
    default: Date.now
  },
  numberOfStudents: Number,
  aadhaarNumber: String,
  gstNumber: String,
  courses: [String],
  logo: String,

 
  currentPlan: String,
  planStatus: {
    type: String,
    
  },
  planStartDate: Date,
  planEndDate: Date,
  hasPurchasedPlanBefore: {
    type: Boolean,
    default: false
  },
  customFeatures: {
    academic: {
      studentInfo: { type: Boolean, default: false },
      classrooms: { type: Boolean, default: false },
      exam: { type: Boolean, default: false },
      attendance: { type: Boolean, default: false },
      timetable: { type: Boolean, default: false },
    },
    reports: {
      studentsReport: { type: Boolean, default: false },
      classroomActivity: { type: Boolean, default: false }
    },
    administration: {
      certificate: { type: Boolean, default: false },
      idCard: { type: Boolean, default: false }
    }
  },

  status: {
    type: String,
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Institute", instituteSchema);
