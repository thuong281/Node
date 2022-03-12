const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  coordinates: [Number],
  lastUpdated: {
    type: Number,
    default: new Date().getTime(),
  },
});

module.exports = mongoose.model("Device", deviceSchema);
