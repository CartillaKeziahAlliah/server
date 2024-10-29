const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "admin", "teacher"],
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
      enum: ["blocked", "Dropped", "Active"],
      default: "active",
      required: false,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
