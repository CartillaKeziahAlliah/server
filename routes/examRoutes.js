const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");

// POST /exams - Create a new exam
router.post("/", examController.createExam);

// GET /exams/subject/:subjectId - Get all exams by subjectId
router.get("/bysubject/:subjectId", examController.getExamsBySubject);

// PUT /exams/:examId - Update an existing exam

// GET /exams/:examId - Get a single exam by examId
router.get("/:examId", examController.getExamById);

router.delete("/:examId", examController.deleteExam);

router.put("/:examId", examController.editExam);
router.get("/:examId/scores", examController.getExamScores);
router.post("/:examId/take", examController.takeExam);
router.post("/:examId/check", examController.checkIfUserHasTakenExam);

module.exports = router;
