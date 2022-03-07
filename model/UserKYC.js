const mongoose = require("mongoose");
const { array } = require("../utils/multer");

const userKYCSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  nationalId: {
    type: String,
    required: true,
  },
  frontImage: {
    type: String,
    required: true,
  },
  cloudinary_id_1: {
    type: String,
    required: true,
  },
  backImage: {
    type: String,
    required: true,
  },
  cloudinary_id_2: {
    type: String,
    required: true,
  },
  verified: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("UserKYC", userKYCSchema);
