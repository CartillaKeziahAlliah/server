const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

// POST /exams - Create a new exam
router.post("/", quizController.createQuiz);

// GET /exams/subject/:subjectId - Get all exams by subjectId
router.get("/bysubject/:subjectId", quizController.getQuizzesBySubject);

// PUT /exams/:examId - Update an existing exam

// GET /exams/:examId - Get a single exam by examId
router.get("/:quizId", quizController.getQuizById);

router.delete("/:quizId", quizController.deleteQuiz);

router.put("/:quizId", quizController.editQuiz); // <-- Add this route for editing an exam

module.exports = router;
