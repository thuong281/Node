const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  deviceName: {
    type: String,
    required: true,
  },
  coordinates: [Number],
  lastUpdated: {
    type: Number,
    default: new Date().getTime() - 1000 * 60,
  },
});

module.exports = mongoose.model("Device", deviceSchema);
