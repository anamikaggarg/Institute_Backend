const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // model/courseModal.js mein ye line honi chahiye:
courseId: { type: String, unique: true, required: true },
  students: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Healthy', 'Active', 'Average'], 
    default: 'Active' 
  },
  faculty: { type: String, required: true },
  duration: { type: String, required: true },
  progress: { type: Number, default: 0 }, // percentage 0-100
  maxSeats: { type: Number, required: true },
  nextBatch: { type: Date },
  description: { type: String }
}, { timestamps: true }); // Isse createdAt aur updatedAt apne aap mil jayenge

module.exports = mongoose.model('Courses', CourseSchema); // ✅ IMPORTANT