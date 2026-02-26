const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  billId: { type: String, required: true },

  instituteId: { type: String, required: true },
  planId: { type: String, required: true },
  planName: { type: String, required: true },

  months: { type: Number, required: true },

  basePrice: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  promoCode: { type: String, default: "" },
  promoAmount: { type: Number, default: 0 },

  gstAmount: { type: Number, required: true },

  finalAmount: { type: Number, required: true },

  currency: { type: String, default: "INR" },

  paymentStatus: { 
    type: String ,default:"pending"
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("billings", BillSchema);