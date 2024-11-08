const express = require("express");
const subjectController = require("../controllers/SubjectController"); // Adjust the path as needed

const router = express.Router();

router.post("/", subjectController.addSubject);
router.get("/:teacherId", subjectController.getAllSubjectsByTeacherId);
router.get("/section/:sectionId", subjectController.getSubjectsBySectionId);
router.get("/:studentId/subjects", subjectController.getStudentSubjects);
router.get("/subjects/:subjectId", subjectController.getSubjectById);

module.exports = router;
