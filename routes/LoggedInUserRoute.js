const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { getProfile, getAllUsers } = require("../controllers/ProfileController");
const router = express.Router();

router.get("/getUser", authenticateToken, getProfile);

router.get("/all", getAllUsers);
module.exports = router;
