const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  registerNationalId: {
    type: String,
    required: true,
  },
  devicePlate: {
    type: String,
    required: true,
  },
  deviceColor: {
    type: String,
    required: true,
  },
  deviceManufacturer: {
    type: String,
    required: true,
  },
  coordinates: [Number],
  createdDate: {
    type: Number,
    required: true,
  },
  createdUser: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Number,
    default: null,
  },
  updatedUser: {
    type: String,
    default: null,
  },
  buyDate: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  updatedLocationTime: {
    type: Number,
    required: true,
    default: new Date().getTime() - 60 * 1000,
  },
});

module.exports = mongoose.model("Device", deviceSchema);
