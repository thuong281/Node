const Device = require("../model/Device");
const jwt = require("jsonwebtoken");
const router = require("./auth");
const User = require("../model/User");

// insesrt new device
router.put("/insert-device", async (req, res) => {
  const jwtToken = req.header("auth-token");
  const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
  const userId = verified._id;

  try {
    const newDevice = await new Device({
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
    return res.status(201).send({ msg: "Thêm thiết bị thành công" });
  } catch (error) {
    return res.status(500).send({ msg: "Thêm thiết bị thất bại" });
  }
});

module.exports = router;

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
          lastUpdated: Date.now(),
        },
      }
    );
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

// get list device of user
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
          device_id: listDevice[i]._id,
          isOnline: 0,
        });
      } else {
        listDeviceWithStatus.push({
          device_id: listDevice[i]._id,
          isOnline: 1,
        });
      }
    }
    return res.status(200).send({ data: listDeviceWithStatus });
  } catch (error) {
    return res.status(500).send(error);
  }
});
