const express = require("express");
const { accessChats, fetchChats, groupCreate, groupRename, groupRemove, groupAdd } = require("../controller/chatController");
const { protect } = require("../middleware/authmiddleware");

const router = express.Router();

router.route("/").post(protect,accessChats);
router.route("/").get(protect,fetchChats);
router.route("/creategroup").post(protect,groupCreate);
router.route("/renamegroup").put(protect,groupRename);
router.route("/removeuser").put(protect,groupRemove);
router.route("/adduser").put(protect,groupAdd);

module.exports = router;