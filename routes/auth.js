const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../validation");

// register
router.post("/register", registerValidation, async (req, res) => {
  // check user name exist
  const userNameExist = await User.findOne({ userName: req.body.user_name });
  if (userNameExist) return res.status(400).send({ msg: "username exists" });

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // create new user
  const user = new User({
    name: req.body.name,
    userName: req.body.user_name,
    password: hashPassword,
    isAdmin: 0,
  });
  try {
    const saveUser = await user.save();
    return res.status(201).send({ msg: "User created successfully" });
  } catch (err) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// register admin
router.post("/register-admin", registerValidation, async (req, res) => {
  // check username exist
  const userNameExist = await User.findOne({ userName: req.body.user_name });
  if (userNameExist) return res.status(400).send({ msg: "username exists" });

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // create new user
  const user = new User({
    name: req.body.name,
    userName: req.body.user_name,
    password: hashPassword,
    isAdmin: 1,
  });
  try {
    const saveUser = await user.save();
    return res.status(201).send({ msg: "User created successfully" });
  } catch (err) {
    return res.status(500).send({ msg: "Server error" });
  }
});

// login
router.post("/login", loginValidation, async (req, res) => {
  // check username exist
  const user = await User.findOne({ userName: req.body.user_name });
  if (!user) return res.status(400).send({ msg: "username not exists" });

  // check password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send({ msg: "Wrong password" });

  // create and asign token
  try {
    const token = jwt.sign(
      { _id: user._id, is_admin: user.isAdmin, user_name: user.name },
      process.env.TOKEN_SECRET
    );
    res.header("auth-token", token);
    res.status(200).send({ data: { token: token } });
  } catch (err) {
    return res.status(500).send({ msg: err });
  }
});

module.exports = router;
