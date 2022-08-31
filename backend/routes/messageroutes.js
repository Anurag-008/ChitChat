const express = require("express");
const { sendMessage, fetchMessage } = require("../controller/messageController");
const { protect } = require("../middleware/authmiddleware");


const router = express.Router();

router.route("/").post(protect,sendMessage);
router.route("/:chatID").get(protect,fetchMessage);


module.exports = router;