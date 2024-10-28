const express = require("express");
const {
  addSection,
  getMySections,
  getSectionById,
  getStudentsInSection,
} = require("../controllers/SectionController");
const { get } = require("mongoose");
const router = express.Router();

router.post("/", addSection);

router.get("/:id", getMySections);

router.get("/currentsection/:id", getSectionById);

router.get("/:id/students", getStudentsInSection);

module.exports = router;
