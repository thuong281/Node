const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const verify = require("./routes/verifyToken");
var bodyParser = require("body-parser");

dotenv.config();

const server = app.listen(8000, () => {
  console.log("Server is running");
});

// socket
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// conect to DB
mongoose.connect(process.env.DB_CONNECT, (err, db) => {
  if (err) console.log(err);
  console.log("DB connected");
});

// middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/user", verify);
app.use("/api/device", verify);

// import route
const authRoute = require("./routes/auth");
const userKYCRoute = require("./routes/userKYC");
const userRoute = require("./routes/user");
const deviceRoute = require("./routes/device");
const registerRoute = require("./routes/register");

// route middlewares

//authen route
app.use("/", authRoute);

// api user
app.use("/api/user", userKYCRoute);
app.use("/api/user", userRoute);

// api device
app.use("/api/device", deviceRoute);

// api register
app.use("/api/register", registerRoute);
