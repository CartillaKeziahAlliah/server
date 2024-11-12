const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const { get } = require("mongoose");

// POST /exams - Create a new exam
router.post("/", quizController.createQuiz);

// GET /exams/subject/:subjectId - Get all exams by subjectId
router.get("/bysubject/:subjectId", quizController.getQuizzesBySubject);

// PUT /exams/:examId - Update an existing exam

// GET /exams/:examId - Get a single exam by examId
router.get("/:quizId", quizController.getQuizById);

router.delete("/:quizId", quizController.deleteQuiz);

router.put("/:quizId", quizController.editQuiz); // <-- Add this route for editing an exam
router.get(
  "/check-quiz-attempt/:userId/:quizId",
  quizController.checkQuizAttempt
);
router.get("/:quizId/scores", quizController.getQuizScores);

router.post("/submit/:quizId/:userId", quizController.submitExam);

router.get("/scores/:userId", quizController.fetchScoresByUserId);

router.post("/:quizId/take", quizController.takeQuiz);

module.exports = router;
