const express = require("express");
const {
  addSection,
  getMySections,
  getSectionById,
} = require("../controllers/SectionController");
const router = express.Router();

router.post("/", addSection);

router.get("/:id", getMySections);

router.get("/currentsection/:id", getSectionById);
module.exports = router;
