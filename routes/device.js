const Device = require("../model/Device");
const jwt = require("jsonwebtoken");
const router = require("./auth");
const User = require("../model/User");
const Register = require("../model/Register");
const UserKYC = require("../model/UserKYC");
const express = require("express");
const res = require("express/lib/response");
const app = express();

// insesrt new device
router.put("/insert-device", async (req, res) => {
  const deviceName = req.body.device_name;

  const jwtToken = req.header("auth-token");
  const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
  const userId = verified._id;

  const deviceExist = await Device.findOne({ deviceName: deviceName });

  if (deviceExist)
    return res.status(401).send({ msg: "Duplicate device name" });

  try {
    const newDevice = await new Device({
      deviceName: deviceName,
      userId: userId,
    }).save();

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          listDevice: newDevice._id,
        },
      }
    );
    return res.status(201).send({ msg: "Add device success" });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

//delete device
router.delete("/delete-device/:device_id", async (req, res) => {
  try {
    const deviceId = req.params.device_id;

    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const userId = verified._id;

    const device = await Device.findOne({ _id: deviceId });

    if (!device) return res.status(404).send({ msg: "Device not found" });

    if (device.userId != userId)
      return res
        .status(403)
        .send({ msg: "Do not have right to delete device" });

    const removeDevice = await device.remove();

    const userUpdate = await User.updateOne(
      { _id: userId },
      {
        $pull: {
          listDevice: deviceId,
        },
      }
    );

    return res.status(200).send({ msg: "Delete device success" });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// update device new location
router.put("/update-location", async (req, res) => {
  const deviceId = req.body.device_id;
  const lat = req.body.lat;
  const long = req.body.long;

  try {
    await Device.findOneAndUpdate(
      { _id: deviceId },
      {
        $set: {
          coordinates: [],
          coordinates: [lat, long],
          updatedLocationTime: Date.now(),
        },
      }
    );

    io.sockets.emit("update_device_" + deviceId, { lat: lat, long: long });

    return res.status(200).send({ msg: "Update thành công" });
  } catch (error) {
    return res.status(500).send({ msg: "Update thất bại" });
  }
});

//get device location
router.get("/get-location", async (req, res) => {
  const deviceId = req.query.device_id;
  try {
    const device = await Device.findOne({ _id: deviceId });
    if (!device) {
      return res.status(404).send({ msg: "Không tìm thấy thiết bị" });
    }
    const date = device.lastUpdated;
    const currentDate = new Date().getTime();

    if (device.coordinates.length < 1) {
      return res
        .status(400)
        .send({ msg: "Thiết bị chưa được cập nhật vị trí" });
    }

    if (currentDate - date > 60 * 1000) {
      return res
        .status(400)
        .send({ msg: "Thiết bị chưa được cập nhật vị trí" });
    } else {
      return res.status(200).send({
        data: {
          lat: device.coordinates[0],
          long: device.coordinates[1],
        },
      });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

// get list device of other user
router.get("/device-list", async (req, res) => {
  const userId = req.query.user_id;
  try {
    const user = await User.findOne({ _id: userId });
    const listDeviceId = user.listDevice;
    const listDevice = await Device.find({
      _id: {
        $in: listDeviceId,
      },
    });
    const listDeviceWithStatus = [];
    const currentDate = new Date().getTime();
    for (let i = 0; i < listDevice.length; i++) {
      if (currentDate - listDevice[i].lastUpdated > 60 * 1000) {
        listDeviceWithStatus.push({
          device_name: listDevice[i].deviceName,
          device_id: listDevice[i]._id,
          isOnline: 0,
        });
      } else {
        listDeviceWithStatus.push({
          device_name: listDevice[i].deviceName,
          device_id: listDevice[i]._id,
          isOnline: 1,
        });
      }
    }
    return res.status(200).send({ data: listDeviceWithStatus });
  } catch (error) {
    return res.status(500).send("Server error");
  }
});

// get list device of current user
router.get("/user-device-list", async (req, res) => {
  const jwtToken = req.header("auth-token");
  const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
  const userId = verified._id;

  try {
    const user = await User.findOne({ _id: userId });
    const listDeviceId = user.listDevice;
    const listDevice = await Device.find({
      _id: {
        $in: listDeviceId,
      },
    });
    const listDeviceWithStatus = [];
    const currentDate = new Date().getTime();
    for (let i = 0; i < listDevice.length; i++) {
      if (currentDate - listDevice[i].lastUpdated > 60 * 1000) {
        listDeviceWithStatus.push({
          device_name: listDevice[i].deviceName,
          device_id: listDevice[i]._id,
          isOnline: 0,
        });
      } else {
        listDeviceWithStatus.push({
          device_name: listDevice[i].deviceName,
          device_id: listDevice[i]._id,
          isOnline: 1,
        });
      }
    }
    return res.status(200).send({ data: listDeviceWithStatus });
  } catch (error) {
    return res.status(500).send("Lỗi server");
  }
});

// new part

// insert new device
router.post("/insert", async (req, res) => {
  const registerName = req.body.register_name;
  const registerNationalId = req.body.register_national_id;
  const registerPhone = req.body.register_phone;
  const devicePlate = req.body.device_plate;
  const deviceColor = req.body.device_color;
  const deviceManufacturer = req.body.device_manufacturer;
  const deviceBuyDate = req.body.device_buy_date;

  if (
    !registerName ||
    !registerNationalId ||
    !registerPhone ||
    !devicePlate ||
    !deviceColor ||
    !deviceManufacturer ||
    !deviceBuyDate
  ) {
    return res.status(400).send({ msg: "Missing parameter" });
  }
  try {
    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const userName = verified.user_name;

    const findDevice = await Device.findOne({ devicePlate: devicePlate });

    if (findDevice) {
      return res.status(400).send({ msg: "This number plate already existed" });
    }

    const register = await Register.findOne({ nationalId: registerNationalId });
    if (register) {
      if (registerName != register.name) {
        return res
          .status(400)
          .send({ msg: "Register existed but name doesn't match" });
      }

      if (registerPhone != register.phoneNumber) {
        return res
          .status(400)
          .send({ msg: "Register existed but phone number doesn't match" });
      }

      const newDevice = new Device({
        registerNationalId: registerNationalId,
        devicePlate: devicePlate,
        deviceColor: deviceColor,
        deviceManufacturer: deviceManufacturer,
        createdUser: userName,
        buyDate: deviceBuyDate,
      });

      const saveDevice = await newDevice.save();

      const addDeviceToRegister = await Register.findOneAndUpdate(
        { nationalId: registerNationalId },
        {
          $push: {
            listDeviceId: newDevice._id,
          },
        }
      );
    } else {
      const newRegister = new Register({
        name: registerName,
        nationalId: registerNationalId,
        phoneNumber: registerPhone,
      });

      const saveRegister = await newRegister.save();

      const newDevice = new Device({
        registerNationalId: saveRegister.nationalId,
        devicePlate: devicePlate,
        deviceColor: deviceColor,
        deviceManufacturer: deviceManufacturer,
        createdUser: userName,
        updatedUser: userName,
        buyDate: deviceBuyDate,
        createdDate: new Date().getTime(),
        lastUpdated: new Date().getTime(),
      });

      const saveDevice = await newDevice.save();

      const addDeviceToRegister = await Register.findOneAndUpdate(
        { nationalId: registerNationalId },
        {
          $push: {
            listDeviceId: newDevice._id,
          },
        }
      );
    }
    return res.status(201).send({ msg: "Device created successfully" });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// get inserted device history of current user
router.get("/insert-history/:page", async (req, res) => {
  let page = req.params.page || 1;
  try {
    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const userName = verified.user_name;

    const listDevice = await Device.find({ createdUser: userName }).sort({
      createdDate: -1,
    });

    return res.status(200).send({
      msg: "Success",
      data: listDevice.slice((page - 1) * 10, page * 10),
    });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// search device by plate number
router.get("/search", async (req, res) => {
  try {
    const word = req.query.word;

    const listDevice = await Device.find({
      devicePlate: { $regex: word, $options: "i" },
    });

    const currentDate = new Date().getTime();

    for (const device of listDevice) {
      if (currentDate - device.updatedLocationTime > 60 * 1000) {
        device["isActive"] = false;
      } else {
        device["isActive"] = true;
      }
    }

    return res.status(200).send({ msg: "Success", data: listDevice });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// get device detail by id
router.get("/", async (req, res) => {
  try {
    const deviceId = req.query.id;
    const device = await Device.findOne({ _id: deviceId });

    const currentDate = new Date().getTime();

    if (currentDate - device.updatedLocationTime > 60 * 1000) {
      device["isActive"] = false;
    } else {
      device["isActive"] = true;
    }

    return res.status(200).send({ msg: "Success", data: device });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// update device
router.put("/update", async (req, res) => {
  try {
    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const userName = verified.user_name;

    const deviceId = req.body.device_id;
    const devicePlate = req.body.device_palate;
    const deviceColor = req.body.device_color;
    const deviceManufacturer = req.body.device_manufacturer;
    const deviceBuyDate = req.body.device_buy_date;

    if (!devicePlate || !deviceColor || !deviceManufacturer || !deviceBuyDate) {
      return res.status(400).send({ msg: "Please fill all the fielddd" });
    }

    await Device.findOneAndUpdate(
      { _id: deviceId },
      {
        $set: {
          devicePlate: devicePlate,
          deviceColor: deviceColor,
          deviceManufacturer: deviceManufacturer,
          deviceBuyDate: deviceBuyDate,
          lastUpdated: Date.now(),
          updatedUser: userName,
        },
      }
    );
    return res.status(204).send({ msg: "Success" });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// remove device
router.delete("/:device_id", async (req, res) => {
  try {
    const device = await Device.findOne({ _id: req.params.device_id });

    if (!device) {
      return res.status(404).send({ msg: "Device not found" });
    }

    const register = await Register.updateOne(
      {
        nationalId: device.registerNationalId,
      },
      {
        $pull: {
          listDeviceId: req.params.device_id,
        },
      }
    );

    await device.remove();

    return res.status(200).send({ msg: "Delete Successfully" });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
});

module.exports = router;
