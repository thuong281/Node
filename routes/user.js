const User = require("../model/User");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// get current user
router.get("/", async (req, res) => {
  try {
    // get user id
    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const userId = verified._id;

    // get user
    const user = await User.findById(mongoose.Types.ObjectId(userId));
    if (!user) {
      return res.status(400).send({ msg: "Không tìm thấy người dùng" });
    }
    return res.status(200).send({ data: user });
  } catch (err) {
    return res.status(500).send({ msg: "Lỗi server" });
  }
});

// request to follow other user
router.put("/request-follow", async (req, res) => {
  try {
    // get user want to follow id
    const userToFollowId = req.body.user_id;
    if (!userToFollowId)
      return res.status(400).send({ msg: "Thiếu params user_id" });

    // check if user want to follow exist
    const checkUserExist = await User.findById(userToFollowId);
    if (!checkUserExist)
      return res
        .status(400)
        .send({ msg: "Người bạn muốn theo dõi không tồn tại" });

    // get user id
    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const userId = verified._id;

    // get user
    const user = await User.findById(mongoose.Types.ObjectId(userId));
    const listFollowing = Array.prototype.concat(
      user.userFollowingPending,
      user.userFollowing
    );

    // check if user already request following
    if (listFollowing.includes(userToFollowId)) {
      return res
        .status(400)
        .send({ msg: "Bạn đã gửi yêu cầu theo dõi người này rồi" });
    }

    // update both user data
    await User.updateOne(
      { _id: userToFollowId },
      {
        $push: {
          userFollowerPending: userId,
        },
      }
    ).then(
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            userFollowingPending: userToFollowId,
          },
        }
      )
    );

    return res.status(200).send({ msg: "Gửi yêu cầu thành công" });
  } catch (err) {
    return res.status(500).send({ msg: "Lỗi server" });
  }
});

// get list user request to follow
router.get("/pending-follow-request", async (req, res) => {
  try {
    // get user id
    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const userId = verified._id;

    // get list user id
    const user = await User.findById(userId);
    const listUserRequest = user.userFollowerPending;

    // get detail list user
    const listUserDetail = await User.find({
      _id: {
        $in: listUserRequest,
      },
    });
    return res.status(200).send({ data: listUserDetail });
  } catch (err) {
    return res.status(500).send({ msg: "Lỗi server" });
  }
});

// approve/reject following request
router.put("/confirm-follow", async (req, res) => {
  try {
    const approve = req.body.approve;
    const userRequestId = req.body.user_request;
    if (!approve) {
      return res.status(400).send({ msg: "Thiếu params approve" });
    }
    if (!userRequestId) {
      return res.status(400).send({ msg: "Thiếu params user_request" });
    }

    // get user id
    const jwtToken = req.header("auth-token");
    const verified = jwt.verify(jwtToken, process.env.TOKEN_SECRET);
    const userId = verified._id;

    // get request follow user
    const userRequest = await User.findById(userRequestId);
    if (!userRequest) {
      return res.status(400).send({ msg: "Không tìm thấy user" });
    }

    // get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(400).send({ msg: "Không tìm thấy user" });
    }

    // get list user request
    const listUserRequest = currentUser.userFollowerPending;
    if (!listUserRequest.includes(userRequestId)) {
      return res.status(400).send({ msg: "Không tìm thấy user" });
    }

    // approve
    if (approve == 1) {
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            userFollower: userRequestId,
          },
          $pull: {
            userFollowerPending: userRequestId,
          },
        }
      ).then(
        await User.updateOne(
          { _id: userRequestId },
          {
            $push: {
              userFollowing: userId,
            },
            $pull: {
              userFollowingPending: userId,
            },
          }
        )
      );
      return res.status(200).send({ msg: "Chấp nhận thành công" });
    } else if (approve == 0) {
      // reject
      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            userFollowerPending: userRequestId,
          },
        }
      ).then(
        await User.updateOne(
          { _id: userRequestId },
          {
            $pull: {
              userFollowingPending: userId,
            },
          }
        )
      );
      return res.status(200).send({ msg: "Chấp nhận thành công" });
    }
  } catch (err) {
    return res.status(500).send({ msg: "Lỗi server" });
  }
});

module.exports = router;
