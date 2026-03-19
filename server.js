require("dotenv").config();

const express = require("express")
const app = express()
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser")
const Sadminrouter = require("./routes/Admin")
const InstReg = require("./routes/Institute")
const plans = require("./routes/Plans");
const Billing = require("./routes/Bill");
const Student = require("./routes/Student")
const staffRoutes = require("./routes/Staff");




const port = process.env.PORT || 1234;


mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connected")
}).catch(err => console.log(err))




app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const allowedOrigins = [
  "http://localhost:5173",
  "https://institute-website-sand.vercel.app",
  "https://institute-backend-0ncp.onrender.com",
    "https://project-frontend-eqr4.vercel.app",
    "https://institute-website-git-main-sneha-namdevs-projects.vercel.app",
"https://institute-website-buk46o0mh-sneha-namdevs-projects.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  session({
   secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    }
  })
);

// app.use("/",)
app.use("/Sadmin",Sadminrouter);
app.use("/institute",InstReg);
app.use("/plans",plans);
app.use("/billing",Billing);
app.use("/student",Student);
app.use("/api/staff", staffRoutes);








app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})




