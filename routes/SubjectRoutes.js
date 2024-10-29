const express = require("express");
const subjectController = require("../controllers/SubjectController"); // Adjust the path as needed
const { get } = require("mongoose");

const router = express.Router();

router.post("/", subjectController.addSubject);
router.get("/:teacherId", subjectController.getAllSubjectsByTeacherId);
router.get("/section/:sectionId", subjectController.getSubjectsBySectionId);
router.get("/:studentId/subjects", subjectController.getStudentSubjects);

module.exports = router;
