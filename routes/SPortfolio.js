const express = require("express");
const router = express.Router();
const Portfolio = require("../model/studentPortfolio");

router.post("/create", async (req, res) => {
  try {
    const data = req.body;

    const newPortfolio = await Portfolio.create(data);

    res.status(201).json({
      success: true,
      message: "Portfolio saved successfully",
      data: newPortfolio
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
});

router.get("/all", async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: portfolios
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    res.json({
      success: true,
      data: portfolio
    });

  } catch (err) {
    res.status(404).json({ message: "Not found" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;