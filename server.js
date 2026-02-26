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


const port = process.env.PORT || 1234;


mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connected")
}).catch(err => console.log(err))




app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use(
  cors({
    origin: "http://localhost:5173",
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
app.use("/student",Student)








app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})




