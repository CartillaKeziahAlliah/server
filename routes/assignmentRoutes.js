const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");

router.post("/", assignmentController.createAssignment);

router.get(
  "/bysubject/:subjectId",
  assignmentController.getAssignmentsBySubject
);

router.get("/:assId", assignmentController.getAssignmentById);

router.delete("/:assId", assignmentController.deleteAssignment);

router.put("/:assId", assignmentController.editAssignment);

router.get("/scores/:userId", assignmentController.fetchScoresByUserId);

router.get("/:AssignmentId/scores", assignmentController.getAssScores);

router.post("/:assignmentId/take", assignmentController.takeAssignment);
module.exports = router;
