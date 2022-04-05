const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Register = require("../model/Register");
const router = require("express").Router();

// search register by national id
router.get("/search", async (req, res) => {
  try {
    const word = req.query.word;

    const listRegister = await Register.find({
      nationalId: { $regex: word, $options: "i" },
    });

    const listResult = [];

    for (const register of listRegister) {
      listResult.push({
        name: register.name,
        national_id: register.nationalId,
        phone_number: register.phoneNumber,
        device_count: register.listDeviceId.length,
      });
    }
    return res.status(200).send({ msg: "Success", data: listResult });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

module.exports = router;
