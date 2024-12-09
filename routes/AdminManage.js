const express = require("express");
const router = express.Router();
const AdminManageController = require("../controllers/AdminManageController");

router.get("/teachers", AdminManageController.getTeachers);

router.post("/addInstructor", AdminManageController.addInstructor);

// Route to block a user (only accessible by admin/masterAdmin)
router.patch("/block-user/:userId", AdminManageController.blockUser);

router.patch("/unblock-user/:userId", AdminManageController.unblockUser);

router.get("/admins", AdminManageController.getAdmins);

// Add a new admin or master admin
router.post("/admins", AdminManageController.addAdmin);

// Remove an admin or master admin
router.delete("/admins/:id", AdminManageController.removeAdmin);

router.get("/", AdminManageController.getSubjects);

// Route to update a subject
router.put("/subjects/:id", AdminManageController.updateSubject);

// Route to delete a subject
router.delete("/subjects/:id", AdminManageController.deleteSubject);

router.post("/add", AdminManageController.addSubject);

router.delete("/user/:userId", AdminManageController.deleteUser);

module.exports = router;
