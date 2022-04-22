const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // userFollowerPending: {
  //   type: Array,
  //   default: [],
  // },
  // userFollower: {
  //   type: Array,
  //   default: [],
  // },
  // userFollowing: {
  //   type: Array,
  //   default: [],
  // },
  // userFollowingPending: {
  //   type: Array,
  //   default: [],
  // },
  // listDevice: [String],
  isAdmin: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
