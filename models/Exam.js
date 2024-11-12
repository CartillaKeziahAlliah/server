const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [
    {
      optionText: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
    },
  ],
  marks: {
    type: Number,
    required: true,
  },
});

const examSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  questions: [questionSchema],
  duration: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  passMarks: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  scores: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      obtainedMarks: {
        type: Number,
        required: true,
      },
      passed: {
        type: Boolean,
        required: true,
      },
      examDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
