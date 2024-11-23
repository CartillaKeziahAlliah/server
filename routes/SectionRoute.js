const express = require("express");
const {
  addSection,
  getMySections,
  getSectionById,
  getStudentsInSection,
  getAllSections,
  updateSection,
  deleteSection,
  addTeacher,
  addStudent,
} = require("../controllers/SectionController");
const { get } = require("mongoose");
const router = express.Router();

router.post("/", addSection);

router.get("/:id", getMySections);

router.get("/currentsection/:id", getSectionById);

router.get("/:id/students", getStudentsInSection);

router.get("/", getAllSections);

router.put("/:sectionId", updateSection);

router.delete("/:sectionId", deleteSection);

router.put("/:sectionId/teacher/:userId", addTeacher);

// Route for adding a student to a section
router.put("/:sectionId/student/:userId", addStudent);
module.exports = router;
