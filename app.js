const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const verify = require("./routes/verifyToken");
var bodyParser = require("body-parser");

dotenv.config();

// conect to DB
mongoose.connect(process.env.DB_CONNECT, () => console.log("DB sục cặc"));

// middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/user", verify);

// import route
const authRoute = require("./routes/auth");
const testRoute = require("./routes/sucCac");
const userKYCRoute = require("./routes/userKYC");

// route middlewares

//authen route
app.use("/", authRoute);
app.use("/api/test", testRoute);

// upload user document
app.use("/api/user", userKYCRoute);

app.listen(8000, () => {
  console.log("Sục cặc bắn tinh");
});
