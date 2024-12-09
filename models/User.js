const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: false, unique: true }, // Added username
    idNumber: { type: String, required: false, unique: true }, // Added idNumber
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "admin", "teacher", "masterAdmin"],
      default: "student",
      required: true,
    },
    LRN: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: "" },
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
    finalGrade: [
      { gradeLevel: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" } },
    ],
    status: {
      type: String,
      enum: ["blocked", "Dropped", "Active", "Request"],
      default: "Request",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
