const express = require("express");
const { registerUser, authUser, searchUser } = require("../controller/userController");
const { protect } = require("../middleware/authmiddleware");

const router = express.Router();


router.route("/").post(registerUser);
router.route("/login").post(authUser);
router.route("/").get(protect,searchUser);


module.exports = router;