const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    section_name: { type: String, required: true },
    grade_level: { type: String, required: true },
    teacher: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    adviser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", sectionSchema);
