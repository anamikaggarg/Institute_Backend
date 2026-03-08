const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({

  InstituteId: {
    type: String,
    required: true
  },

  InstituteName: {
    type: String,
    required: true
  },

  ReferenceName: {
    type: String,
    required: true
  },

  firstName: {
    type: String,
    required: true
  },

  LastName: {
    type: String,
    required: true
  },

  UserRole: {
    type: String,
    required: true
  },

  ContactNumber: {
    type: String,
    required: true
  },

  AadharNumber: {
    type: String,
    required: true
  },

  PanNumber: {
    type: String,
    required: true
  },

  FathersName: {
    type: String,
    required: true
  },

  MothersName: {
    type: String,
    required: true
  },

  AppointmentDate: {
    type: Date,
    required: true
  },

  HighestQualification: {
    type: String,
    required: true
  },

  ESI: {
    type: String,
    required: true
  },

  Country: {
    type: String,
    required: true
  },

  State: {
    type: String,
    required: true
  },

  Address: {
    type: String,
    required: true
  },

  Gender: {
    type: String,
    required: true
  },

  BloodGroup: {
    type: String,
    required: true
  },

  Dob: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    default: "Active"
  }

}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);