const mongoose = require("mongoose");

// 🔹 Subject Schema
const subjectSchema = new mongoose.Schema(
  {
    subjectId: { type: String },
    name: { type: String, required: true },
    code: { type: String },

    duration: { type: Number },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    subjectTeacher: {
      type: [String],
      default: [],
    },

    students: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

// 🔹 Course Schema
const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    unique: true,
  },

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "No description provided",
  },

  students: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["Healthy", "Active", "Average"],
    default: "Active",
  },

  duration: String,

  classTeacher: {
    type: [String],
    default: [],
  },


  nextBatch: Date,

  subjects: {
    type: [subjectSchema],
    default: [],
  },

  enrolledStudents: [
    {
      studentId: String,
      name: String,
      status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Courses", courseSchema);