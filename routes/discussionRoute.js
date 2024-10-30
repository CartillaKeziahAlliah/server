// discussionRoutes.js
const express = require("express");
const {
  createDiscussion,
  deleteDiscussion,
  getDiscussionsBySubjectId,
  markAsRead,
  getStudentsReadByDiscussionId,
} = require("../controllers/discussionController"); // Adjust the path as necessary
const { get } = require("mongoose");

const router = express.Router();

// Create a discussion with optional PDF upload
router.post("/", createDiscussion);

// Delete a discussion
router.delete("/:id", deleteDiscussion);

// View all discussions
router.get("/subject/:subjectId", getDiscussionsBySubjectId);

// Mark a discussion as read
router.patch("/:id/read", markAsRead);

router.get("/:discussionId/students-read", getStudentsReadByDiscussionId);

module.exports = router;
