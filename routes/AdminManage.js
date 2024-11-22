const express = require("express");
const router = express.Router();
const AdminManageController = require("../controllers/AdminManageController");

router.get("/teachers", AdminManageController.getTeachers);

router.post("/addInstructor", AdminManageController.addInstructor);

// Route to block a user (only accessible by admin/masterAdmin)
router.patch("/block-user/:userId", AdminManageController.blockUser);

router.patch("/unblock-user/:userId", AdminManageController.unblockUser);

module.exports = router;
