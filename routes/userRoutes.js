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
  getAllTeachersExlcudedinsection,
  updateUserRoleToMasterAdmin,
  getStudents,
  addOrUpdateStudentSection,
  getStudentsWithoutLRN,
  addOrUpdateLRN,
  getUserStatistics,
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

router.put("/:userId/master-admin", updateUserRoleToMasterAdmin);

router.post("/assignlrn/:userId", assignLRN);

router.post("/addSection", addSectionToUser);
router.get("/user-scores/:userId/:subjectId", getUserScoresWithActivity);
router.get("/users", getAllTeachers);
router.get("/excludedusers/:sectionId", getAllTeachersExlcudedinsection);
router.get("/students", getStudents);
router.get("/students/without-lrn", getStudentsWithoutLRN);
router.post("/students/add-lrn", addOrUpdateLRN);

router.post("/add-student", addOrUpdateStudentSection);
router.get("/statistics", getUserStatistics);

module.exports = router;
