const jwt = require("jsonwebtoken");
const Institute = require("../model/Institute");
const verifyInstituteToken = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Please login first" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach decoded institute info
    req.institute = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

module.exports = verifyInstituteToken;