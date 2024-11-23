const express = require("express");
const { login, logout, signup } = require("../controllers/AuthController");
const authenticateToken = require("../middlewares/authenticateToken");
const { uploadProfilePicture } = require("../middlewares/multer");
const {
  updateProfile,
  assignLRN,
  addSectionToUser,
  getUserScoresWithActivity,
  getAllTeachers,
} = require("../controllers/usersController");

const router = express.Router();

router.post("/login", login);

router.post("/signup", signup);

router.post("/logout", authenticateToken, logout);

router.put(
  "/updateprofile",
  [authenticateToken, uploadProfilePicture.single("avatar")],
  updateProfile
);

router.post("/assignlrn/:userId", assignLRN);

router.post("/addSection", addSectionToUser);
router.get("/user-scores/:userId", getUserScoresWithActivity);
router.get("/users", getAllTeachers);
module.exports = router;
