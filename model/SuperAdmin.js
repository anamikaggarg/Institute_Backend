const mongoose = require("mongoose");

const SuperAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "SuperAdmin"
    },
    lastLogin: {
      type: Date
    },
    
  otp: {
  type: Number
},
otpExpire: {
  type: Number
},
resetSessionExpire: {
  type: Number
},

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("superadmin", SuperAdminSchema);
