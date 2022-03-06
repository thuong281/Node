const router = require("express").Router();
const verify = require("./verifyToken");

router.get("/", verify, (req, res) => {
  res.send("ban tinh tung toe");
});

module.exports = router;
