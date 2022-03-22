const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const verify = require("./routes/verifyToken");
var bodyParser = require("body-parser");

dotenv.config();

const server = app.listen(8000, () => {
  console.log("Sục cặc bắn tinh");
});

const io = require("socket.io")(server);
app.set("io", io);

io.on("connection", (socket) => {
  console.log("a user connected");
  io.sockets.emit("receive_msg", { data: "cac" });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// conect to DB
mongoose.connect(process.env.DB_CONNECT, (err, db) => {
  if (err) console.log(err);
  console.log("DB sục cặc");
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

// route middlewares

//authen route
app.use("/", authRoute);

// api user
app.use("/api/user", userKYCRoute);
app.use("/api/user", userRoute);
app.use("/api/device", deviceRoute);

global.io = io;
