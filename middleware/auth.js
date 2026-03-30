const jwt = require("jsonwebtoken");
const Institute = require("../model/Institute");

const verifyInstituteToken = async (req, res, next) => {
  try {
    const token = req.session?.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Please login first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const institute = await Institute.findOne({ instituteId: decoded.instituteId });
    if (!institute) {
      return res.status(401).json({ message: "Invalid token or institute not found" });
    }

    // ✅ Attach institute info to request
    req.institute = institute;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

module.exports = verifyInstituteToken;