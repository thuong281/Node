const UserKYC = require("../model/UserKYC");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const router = require("express").Router();
const jwt = require("jsonwebtoken");

// upload new user kyc
router.post("/upload-kyc", upload.array("image", 2), async (req, res) => {
  try {
    const nationalId = req.body.national_id;
    const user = await UserKYC.findOne({ nationalId: nationalId });
    if (user) return res.status(400).send({ msg: "Căn cước đã tồn tại" });

    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const userId = verified._id;

    const userExist = await UserKYC.findOne({ userId: userId });
    if (userExist)
      return res
        .status(400)
        .send({ msg: "Mỗi tài khoản chỉ được xác thực với 1 căn cước" });

    const files = req.files;
    const results = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path);
      results.push(result);
    }

    let userKYC = new UserKYC({
      userId: userId,
      nationalId: nationalId,
      frontImage: results[0].secure_url,
      cloudinary_id_1: results[0].public_id,
      backImage: results[1].secure_url,
      cloudinary_id_2: results[1].public_id,
    });

    await userKYC.save();
    return res.status(201).send({ msg: "Upload thành công" });
  } catch (err) {
    return res.status(500).send({ msg: "Upload thất bại" });
  }
});

// get all user KYC
router.get("/user-kyc", async (req, res) => {
  try {
    const users = await UserKYC.find();
    return res.status(200).send({
      msg: "Thành công",
      data: users,
    });
  } catch (err) {
    return res.status(500).send({ msg: err });
  }
});

// delete specific user kyc
router.delete("/user-kyc/:_id", async (req, res) => {
  try {
    const user = await UserKYC.findOne({ userId: req.params._id });
    await cloudinary.uploader.destroy(user.cloudinary_id_1);
    await cloudinary.uploader.destroy(user.cloudinary_id_2);
    const cac = await user.remove();
    if (cac.userId) {
      res.status(200).send({ msg: "Xóa thành công" });
    } else {
      return res.status(400).send({ msg: "Xóa không thành công" });
    }
  } catch (err) {
    return res.status(500).send({ msg: err });
  }
});

// approve user kyc
router.put("/user-kyc/confirm/:_id", async (req, res) => {
  try {
    await UserKYC.findOneAndUpdate(
      { userId: req.params._id },
      {
        $set: {
          verified: 1,
        },
      }
    ).then((result) => {
      return res.status(200).send({ msg: "Xác thực thành công" });
    });
  } catch (err) {
    return res.status(500).send({ msg: err });
  }
});

module.exports = router;
