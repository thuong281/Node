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

// get all user KYC not verified
router.get("/user-kyc", async (req, res) => {
  try {
    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const isAdmin = verified.is_admin;

    if (isAdmin == 0)
      return res.status(400).send({ msg: "Chỉ admin mới được lấy thông tin" });

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
router.delete("/user-kyc/delete/:_id", async (req, res) => {
  try {
    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const isAdmin = verified.is_admin;

    if (isAdmin == 0)
      return res.status(400).send({ msg: "Chỉ admin mới được xóa tài liệu" });

    const user = await UserKYC.findOne({ userId: req.params._id });

    if (!user) return res.status(404).send({ msg: "Không tìm thấý user" });

    await cloudinary.uploader.destroy(user.cloudinary_id_1);
    await cloudinary.uploader.destroy(user.cloudinary_id_2);
    const userRemoved = await user.remove();

    if (userRemoved.userId) {
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
    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const isAdmin = verified.is_admin;

    if (isAdmin == 0)
      return res
        .status(400)
        .send({ msg: "Chỉ admin mới được xác nhận tài liệu" });

    const userKYC = await UserKYC.findOneAndUpdate(
      { userId: req.params._id },
      {
        $set: {
          verified: 1,
        },
      }
    );
    if (!userKYC) return res.status(404).send({ msg: "Không tìm thấý user" });
    return res.status(200).send({ msg: "Xác thực thành công" });
  } catch (err) {
    return res.status(500).send({ msg: err });
  }
});

// // test change user kyc nationalId
// router.put("/user-kyc-test", async (req, res) => {
//   try {
//     const old = req.body.old_id;
//     const newId = req.body.new_id;
//     await UserKYC.findOneAndUpdate(
//       { nationalId: old },
//       {
//         $set: {
//           nationalId: newId,
//         },
//       }
//     );
//     let io = req.app.get("io");

//     io.on("connection", (socket) => {
//       console.log("a user connected");
//       socket.on("disconnect", () => {
//         console.log("user disconnected");
//       });
//     });
//     return res.status(200).send({ msg: "cac" });
//   } catch (err) {
//     return res.status(500).send({ msg: err.message });
//   }
// });

module.exports = router;
