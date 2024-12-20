const express = require("express");
const subjectController = require("../controllers/SubjectController"); // Adjust the path as needed

const router = express.Router();

router.post("/", subjectController.addSubject);
router.get(
  "/:teacherId",
  subjectController.getAllSubjectsByTeacherIdandSection
);
router.get(
  "/TSubject/:teacherId/:sectionId",
  subjectController.getAllSubjectsByTeacherId
);

router.get("/section/:sectionId", subjectController.getSubjectsBySectionId);
router.get(
  "/student/:studentId/subjects",
  subjectController.getStudentSubjects
);
router.get("/subjects/:subjectId", subjectController.getSubjectById);

module.exports = router;
