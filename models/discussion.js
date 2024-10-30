// discussionModel.js
const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String, // Can be 'pending', 'completed', etc.
      enum: ["pending", "completed"],
      default: "pending",
    },
    studentsRead: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        dateRead: { type: Date, default: Date.now },
      },
    ],
    subjectId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming this references a Subject model
      ref: "Subject", // Change this according to your model's name
      required: true,
    },
  },
  {
    timestamps: true, // Automatically create timestamps for createdAt and updatedAt
  }
);

module.exports = mongoose.model("Discussion", discussionSchema);
