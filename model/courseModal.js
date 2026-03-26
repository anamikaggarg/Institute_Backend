const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  students: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["Healthy", "Active", "Average"],
    default: "Active"
  },

  faculty: {
    type: String,
    required: true
  },

  duration: {
    type: String,
    required: true
  },

  progress: {
    type: Number,
    default: 0
  },

  maxSeats: {
    type: Number,
    required: true
  },

  nextBatch: Date,

  description: String,

  subjects: [String],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Courses", courseSchema);