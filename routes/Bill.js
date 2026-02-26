const express = require("express");
const router = express.Router();
const Bill = require("../model/Bill");
const Plan = require("../model/Plans");
const Institute = require("../model/Institute");

router.post("/create-and-activate/:instituteId/:planId", async (req, res) => {
  try {
    const { instituteId, planId } = req.params;
    let { months, promoCode } = req.body;

    months = Number(months);

    if (!months || months <= 0) {
      return res.status(400).json({ message: "Invalid months selected" });
    }

    const plan = await Plan.findOne({ planId });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const institute = await Institute.findOne({ instituteId });
    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    const selectedDiscount = plan.discounts?.find(
      (d) => d.duration === months
    );

    const baseTotal = plan.actualPrice * months;

    const discountAmount = selectedDiscount
      ? (baseTotal * selectedDiscount.discountPercent) / 100
      : 0;

    const GST_PERCENT = 18;

    const taxableAmount = baseTotal - discountAmount;
    const gstAmount = (taxableAmount * GST_PERCENT) / 100;
    const finalAmount = taxableAmount + gstAmount;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const billing = await Bill.create({
      billId: "BILL-" + Date.now(),
      instituteId,
      planId,
      planName: plan.name,
      months,
      basePrice: baseTotal,
      discountAmount,
      promoCode: promoCode || "",
      promoAmount: 0,
      gstAmount,
      finalAmount,
      startDate,
      endDate,
      paymentStatus: "active"
    });


    institute.currentPlan = planId;
    institute.planStatus = "active";
    institute.planStartDate = startDate;
    institute.planEndDate = endDate;
    institute.hasPurchasedPlanBefore = true;

   
    institute.customFeatures = {
      academic: {
        studentInfo: true,
        classrooms: true,
        exam: true,
        attendance: true,
        timetable: true,
      },
      reports: {
        studentsReport: true,
        classroomActivity: true
      },
      administration: {
        certificate: true,
        idCard: true
      }
    };

    await institute.save();

    const formatDate = (date) =>
      new Date(date)
        .toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
        .replace(",", "")
        .toLowerCase();

    res.status(200).json({
      message: "Plan Activated Successfully",
      billing,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Checkout Failed" });
  }
});

router.get("/:instituteId", async (req, res) => {
  const { instituteId } = req.params;
  try {
    const bills = await Bill.find({ instituteId }).sort({ createdAt: -1 });
    res.json({ bills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bills" });
  }
});

module.exports = router;