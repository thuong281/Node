const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Device = require("../model/Device");
const Register = require("../model/Register");
const router = require("express").Router();

// search register by national id
router.get("/search", async (req, res) => {
  try {
    const word = req.query.word;

    const listRegister = await Register.find({
      nationalId: { $regex: word, $options: "i" },
    });

    // const listResult = [];

    // for (const register of listRegister) {
    //   listResult.push({
    //     name: register.name,
    //     national_id: register.nationalId,
    //     phone_number: register.phoneNumber,
    //     device_count: register.listDeviceId.length,
    //   });
    // }
    return res.status(200).send({ msg: "Success", data: listRegister });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// get single register by id
router.get("/", async (req, res) => {
  try {
    const id = req.query.id;

    const register = await Register.findById(id);

    return res.status(200).send({ msg: "Success", data: register });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// get single register by nationalId
router.get("/national-id", async (req, res) => {
  try {
    const id = req.query.id;

    const register = await Register.findOne({ nationalId: id });

    return res.status(200).send({ msg: "Success", data: register });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// get list device of register
router.get("/devices", async (req, res) => {
  try {
    const id = req.query.id;

    const register = await Register.findById(id);

    const listDevice = [];

    const listDeviceId = register.listDeviceId;
    for (const deviceId of listDeviceId) {
      const device = await Device.findOne({ _id: deviceId });

      const currentDate = new Date().getTime();

      if (currentDate - device.updatedLocationTime > 60 * 1000) {
        device["isActive"] = false;
      } else {
        device["isActive"] = true;
      }

      listDevice.push(device);
    }

    return res.status(200).send({ msg: "Success", data: listDevice });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// update register
router.put("/update", async (req, res) => {
  try {
    const registerId = req.body.register_id;
    const name = req.body.name;
    const nationalId = req.body.national_id;
    const phoneNumber = req.body.phone_number;

    if (!name || !nationalId || !phoneNumber) {
      return res.status(400).send({ msg: "Please fillll all the field" });
    }

    await Register.findOneAndUpdate(
      { _id: registerId },
      {
        $set: {
          name: name,
          nationalId: nationalId,
          phoneNumber: phoneNumber,
        },
      }
    );

    return res.status(204).send({ msg: "Success" });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// delete register
router.delete("/:id", async (req, res) => {
  try {
    const registerId = req.params.id;
    const register = await Register.findById(registerId);
    const listDeviceId = register.listDeviceId;
    for (const deviceId of listDeviceId) {
      await Device.findByIdAndDelete(deviceId);
    }
    await register.delete();

    return res.status(200).send({ msg: "Success" });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

module.exports = router;
