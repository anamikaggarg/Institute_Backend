const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  title: String,
  category: String,
  desc: String,
  year: String,
});

const portfolioSchema = new mongoose.Schema({
  
  name: String,
  email: String,
  phone: String,
  city: String,
  dob: String,
  bio: String,
  avatar: String,        
  addharImage: String,   
  addharNo: String,     

  institution: String,
  degree: String,
  stream: String,
  year: String,
  grade: String,

  interests: [String],

  achievements: [achievementSchema],

  youtube: String,
  instagram: String,
  linkedin: String,
  website: String,

}, { timestamps: true });

module.exports = mongoose.model("Portfolio", portfolioSchema);