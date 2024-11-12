const { json } = require("express");
const Assignment = require("../models/Assignment");
const Subject = require("../models/Subject");
const mongoose = require("mongoose");

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      questions,
      duration,
      totalMarks,
      passMarks,
      deadline, // Added deadline to the destructured request body
    } = req.body;

    // Validate subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Validate questions array
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions array is required" });
    }

    // Validate each question and its options
    for (const question of questions) {
      if (!question.questionText || typeof question.questionText !== "string") {
        return res
          .status(400)
          .json({ message: "Each question must have valid question text." });
      }

      if (!Array.isArray(question.options) || question.options.length === 0) {
        return res
          .status(400)
          .json({ message: "Each question must have at least one option." });
      }

      for (const option of question.options) {
        if (!option.optionText || typeof option.optionText !== "string") {
          return res
            .status(400)
            .json({ message: "Each option must have valid option text." });
        }
        if (typeof option.isCorrect !== "boolean") {
          return res
            .status(400)
            .json({ message: "Each option must specify if it is correct." });
        }
      }

      // Ensure marks are provided for each question
      if (typeof question.marks !== "number" || question.marks <= 0) {
        return res
          .status(400)
          .json({ message: "Each question must have valid marks." });
      }
    }

    // Validate assignment properties
    if (typeof duration !== "number" || duration <= 0) {
      return res
        .status(400)
        .json({ message: "Duration must be a positive number." });
    }
    if (typeof totalMarks !== "number" || totalMarks <= 0) {
      return res
        .status(400)
        .json({ message: "Total marks must be a positive number." });
    }
    if (typeof passMarks !== "number" || passMarks < 0) {
      return res
        .status(400)
        .json({ message: "Pass marks must be a non-negative number." });
    }
    if (
      !deadline ||
      !(new Date(deadline) instanceof Date) ||
      isNaN(new Date(deadline))
    ) {
      return res
        .status(400)
        .json({ message: "Deadline must be a valid date." });
    }

    // Create the new assignment
    const newAssignment = new Assignment({
      title,
      description,
      subject,
      questions,
      duration,
      totalMarks,
      passMarks,
      deadline, // Save the deadline
    });

    // Save the assignment to the database
    const savedAssignment = await newAssignment.save();
    res.status(201).json({
      message: "Assignment created successfully",
      assignment: savedAssignment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create assignment", error: error.message });
  }
};

// Retrieve all assignments by subjectId
exports.getAssignmentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const assignments = await Assignment.find({ subject: subjectId })
      .populate("subject", "subject_name teacher section")
      .populate("scores.studentId");

    if (!assignments || assignments.length === 0) {
      return res
        .status(404)
        .json({ message: "No assignments found for this subject" });
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve assignments",
      error: error.message,
    });
  }
};

// Retrieve a single assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId).populate(
      "subject"
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json(assignment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve assignment", error: error.message });
  }
};

// Delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const deletedAssignment = await Assignment.findByIdAndDelete(assignmentId);

    if (!deletedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete assignment", error: error.message });
  }
};

// Update an existing assignment
exports.editAssignment = async (req, res) => {
  const { assignmentId } = req.params; // Get assignment ID from the URL
  const updatedData = req.body; // Get updated data from the request body

  try {
    // Find and update the assignment by ID
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      {
        ...updatedData, // Spread the updated data to replace fields
        updatedAt: Date.now(), // Update the 'updatedAt' field
      },
      { new: true, runValidators: true } // Return the updated document and validate the data
    );

    if (!updatedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res
      .status(200)
      .json({ message: "Assignment updated successfully", updatedAssignment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating assignment", error: error.message });
  }
};
exports.fetchScoresByUserId = async (req, res) => {
  const userId = req.params.userId; // Assuming userID is passed as a URL parameter

  try {
    const quizzes = await Assignment.find(
      { "scores.studentId": userId },
      { "scores.$": 1, title: 1, description: 1, subject: 1, totalMarks: 1 }
    ).populate("subject", "name");

    if (quizzes.length === 0) {
      return res
        .status(404)
        .json({ message: "No scores found for this user." });
    }

    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching scores by userID:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getAssScores = async (req, res) => {
  try {
    const assignmentId = req.params.AssignmentId;

    const assignment = await Assignment.findById(assignmentId)
      .populate("scores.studentId", "name email")
      .select("scores");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const scoresDetails = assignment.scores.map((score) => ({
      studentId: score.studentId,
      obtainedMarks: score.obtainedMarks,
      passed: score.passed,
      examDate: score.examDate,
    }));

    res.json(scoresDetails); // Send the detailed scores
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.takeAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, answers } = req.body;

    const assignment = await Assignment.findById(assignmentId).exec();
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    let obtainedMarks = 0;

    if (
      Array.isArray(answers) &&
      answers.length === assignment.questions.length
    ) {
      assignment.questions.forEach((question, index) => {
        const studentAnswer = answers[index];

        if (
          typeof studentAnswer === "number" && // Check that it's a number
          studentAnswer >= 0 && // Check that it's not a negative index
          studentAnswer < question.options.length // Ensure it doesn't exceed options array length
        ) {
          const selectedOption = question.options[studentAnswer];
          if (selectedOption && selectedOption.isCorrect) {
            obtainedMarks += question.marks; // Add marks if the answer is correct
          }
        } else {
          console.warn(`Invalid answer at index ${index}:`, studentAnswer);
        }
      });
    }

    const passed = obtainedMarks >= assignment.passMarks;

    assignment.scores.push({
      studentId: new mongoose.Types.ObjectId(studentId), // Fixed instantiation here
      obtainedMarks,
      passed,
      assignmentDate: new Date(),
    });

    await assignment.save();
    return res.json({
      message: "Exam completed successfully",
      obtainedMarks,
      totalMarks: assignment.totalMarks,
      passMarks: assignment.passMarks,
      passed,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while taking the exam" });
  }
};
