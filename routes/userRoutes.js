const express = require("express");
const { login, logout, signup } = require("../controllers/AuthController");
const authenticateToken = require("../middlewares/authenticateToken");
const { uploadProfilePicture } = require("../middlewares/multer");
const { updateProfile } = require("../controllers/usersController");

const router = express.Router();

router.post("/login", login);

router.post("/signup", signup);

router.post("/logout", authenticateToken, logout);

router.put(
  "/updateprofile",
  [authenticateToken, uploadProfilePicture.single("avatar")],
  updateProfile
);
module.exports = router;
