// discussionController.js
const Discussion = require("../models/discussion"); // Adjust the path as necessary
const cloudinary = require("../config/cloudinary"); // Adjust the path as necessary
const { json } = require("express");

// Create a new discussion
const createDiscussion = async (req, res) => {
  try {
    const { title, content, subjectId } = req.body; // Include subjectId

    // Create a new discussion without PDF upload
    const newDiscussion = new Discussion({
      title,
      content,
      subjectId, // Add subjectId to the discussion
    });

    await newDiscussion.save();
    res.status(201).json(newDiscussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a discussion
const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const discussion = await Discussion.findByIdAndDelete(id);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.status(200).json({ message: "Discussion deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View all discussions
const getDiscussionsBySubjectId = async (req, res) => {
  const { subjectId } = req.params; // Extract the subjectId from the request parameters
  try {
    const discussions = await Discussion.find({ subjectId }); // Query the database
    if (!discussions.length) {
      return res
        .status(404)
        .json({ message: "No discussions found for this subject." });
    }
    res.status(200).json(discussions); // Send the discussions back to the client
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle any errors
  }
};

// Mark a discussion as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body; // Assuming studentId is sent in the request body

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Check if the student has already read this discussion
    const alreadyRead = discussion.studentsRead.find(
      (record) => record.studentId.toString() === studentId
    );

    if (!alreadyRead) {
      discussion.studentsRead.push({ studentId });
      await discussion.save();
    }

    res.status(200).json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getStudentsReadByDiscussionId = async (req, res) => {
  const { discussionId } = req.params;

  try {
    const discussion = await Discussion.findById(discussionId)
      .populate("studentsRead.studentId", "name email") // Adjust fields as per your Student schema
      .exec();

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const studentsRead = discussion.studentsRead.map((entry) => ({
      student: entry.studentId, // Contains populated student details
      dateRead: entry.dateRead,
    }));

    res.status(200).json(studentsRead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  createDiscussion,
  deleteDiscussion,
  getDiscussionsBySubjectId,
  markAsRead,
  getStudentsReadByDiscussionId,
};
