const express = require("express");
const router = express.Router();
const Plan = require("../model/Plans");


router.post("/register", async (req, res) => {
    try {
        const planData = req.body;
        if (!planData) {
            return res.status(500).json({
                success: false,
                message: "Plan Details Not Entered"
            })
        }
        const newPlan = new Plan(planData)
        await newPlan.save();
        res.status(201).json({
            message: "Plan registered successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/allPlans", async (req, res) => {
    try {
        const plans = await Plan.find();

        if (plans.length === 0) {
            return res.status(404).json({ message: "No plans found" });
        }

        const planData = plans.map(plan => ({
            planId: plan.planId,
            name: plan.name,
            price: plan.actualPrice,
            currency: plan.currency,
            duration: plan.duration,
            discounts:plan.discounts,
            limits: plan.limits,
            features: plan.features,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt
        }));

        res.status(200).json({
            message: "All plans ",
            plans: planData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
router.get("/:planId", async (req, res) => {
  try {
    const plan = await Plan.findOne({ planId: req.params.planId });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/plan/:planId", async (req, res) => {
    try {
        const planid = req.params.planId;

        const plan = await Plan.findOne({ planId: planid })

        if (!plan) {
            return res.status(500).json({ message: "Plan Not Found" })
        }

        const planData = {
            planId:plan.planId,
            name:plan.name,
            price:plan.actualPrice,
            currency:plan.currency,
            duration:plan.duration,
            discount:plan.discounts,
            limits:{
                students:plan.limits.students,
                staff:plan.limits.staff,
                courses:plan.limits.courses
            },
            features:{
                academic:{
                    studentInfo:plan.features.academic.studentInfo,
                    classrooms:plan.features.academic.classrooms,
                    exam:plan.features.academic.exam,
                    attendance:plan.features.academic.attendance,
                    timetable:plan.features.academic.timetable
                },
                reports:{
                    studentsReport:plan.features.reports.studentsReport,
                    classroomActivity:plan.features.reports.classroomActivity
                },
                administration:{
                    certificate:plan.features.administration.certificate,
                    idCard:plan.features.administration.idCard
                }
            }
        }

        res.status(200).json({
            message:"Plan Fetch Successfully",
            plan:planData
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    } 
})

router.put("/updatePlans/:planId", async (req, res) => {
    try {
        const updatedPlan = await Plan.findOneAndUpdate(
            { planId: req.params.planId },
            { $set: req.body },
            { new: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        res.json({
            message: "Plan updated successfully",
            data: updatedPlan
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 