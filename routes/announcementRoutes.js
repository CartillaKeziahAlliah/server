const express = require("express");
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  markAsRead,
  markAllAsRead,
} = require("../controllers/announcementController");

const router = express.Router();

router.post("/:announcerId", createAnnouncement); // Create a new announcement
router.get("/", getAnnouncements); // Get all announcements
router.delete("/:id", deleteAnnouncement); // Delete an announcement by ID
router.put("/read/:id", markAsRead); // Mark an announcement as read
router.put("/readAll", markAllAsRead); // mark all as read
module.exports = router;
