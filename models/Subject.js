const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subject_name: { type: String, required: true },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
