const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
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
  userFollowerPending: {
    type: Array,
    default: [],
  },
  userFollower: {
    type: Array,
    default: [],
  },
  userFollowing: {
    type: Array,
    default: [],
  },
  userFollowingPending: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("User", userSchema);
