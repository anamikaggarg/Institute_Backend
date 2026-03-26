const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseId: { type: String, unique: true, required: true },
  
 
  instituteId: { 
    type: String, 
    required: true, 
    index: true 
  },

  name: { type: String, required: true },
  status: { type: String, enum: ["Active", "Archived"], default: "Active" },
  duration: { type: String, required: true },
  description: { type: String },
  subjects: [String],
  sections: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Courses", courseSchema);