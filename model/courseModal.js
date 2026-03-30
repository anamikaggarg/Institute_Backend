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

  duration: {
    type: String,
    
  },
 classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff' 
  },

  progress: {
    type: Number,
    default: 0
  },

  maxSeats: {
    type: Number,
    
  },

  nextBatch: Date,

  description: String,

  subjects: [String],

  
enrolledStudents: [
  {
    studentId: String, 
    name: String,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED","REJECTED"],
      default: "PENDING"
    },
    appliedAt: { type: Date, default: Date.now }
  }
],


  createdAt: {
    type: Date,
    default: Date.now
  },

});

module.exports = mongoose.model("Courses", courseSchema);