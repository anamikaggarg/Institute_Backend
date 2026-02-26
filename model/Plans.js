const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
    planId: { type: String, default: Date.now() },
    name: { type: String, required: true },
    actualPrice: { type: Number, required: true },
    currency: { type: String },
    discounts: [
    {
      duration: { type: Number, required: true },
      durationType: { type: String, enum: ["month", "year"], required: true },
      discountPercent: { type: Number }
    }
  ],
    limits: {
        students: { type: Number, required: true, default: 200 },
        staff: { type: Number, required: true, default: 10 },
        courses: { type: Number, default: 0 }
    },

    features: {
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

    }


}, { timestamps: true });

module.exports = mongoose.model("Plan", PlanSchema);