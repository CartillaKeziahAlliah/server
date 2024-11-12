const { json } = require("express");
const Quiz = require("../models/Quiz"); // Update model import to Quiz
const Subject = require("../models/Subject");
const User = require("../models/User"); // Adjust the path as needed

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      questions,
      duration,
      totalMarks,
      passMarks,
      deadline,
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

    // Validate quiz properties
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
    if (
      typeof passMarks !== "number" ||
      passMarks <= 0 ||
      passMarks > totalMarks
    ) {
      return res.status(400).json({
        message:
          "Pass marks must be a positive number and less than or equal to total marks.",
      });
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

    // Create the new quiz
    const newQuiz = new Quiz({
      title,
      description,
      subject,
      questions,
      duration,
      totalMarks,
      passMarks, // Save the pass marks
      deadline,
    });

    // Save the quiz to the database
    const savedQuiz = await newQuiz.save();
    res.status(201).json({
      message: "Quiz created successfully",
      quiz: savedQuiz,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create quiz", error: error.message });
  }
};

// Retrieve all quizzes by subjectId
exports.getQuizzesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const quizzes = await Quiz.find({ subject: subjectId }).populate(
      "subject",
      "subject_name teacher section"
    );

    if (!quizzes || quizzes.length === 0) {
      return res
        .status(404)
        .json({ message: "No quizzes found for this subject" });
    }

    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve quizzes",
      error: error.message,
    });
  }
};

// Retrieve a single quiz by ID

exports.checkQuizAttempt = async (req, res) => {
  const { userId, quizId } = req.params;

  try {
    // Find the quiz by ID and see if the user ID exists in the scores array
    const quiz = await Quiz.findOne({
      _id: quizId,
      "scores.studentId": userId,
    });

    if (quiz) {
      // If the user has a score, they’ve taken the quiz
      return res.json({ hasTakenQuiz: true });
    } else {
      // If no score entry for this user, they haven’t taken it
      return res.json({ hasTakenQuiz: false });
    }
  } catch (error) {
    console.error("Error checking quiz attempt:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Controller function to get all scores of students for a specific quiz
exports.getQuizScores = async (req, res) => {
  try {
    const quizId = req.params.quizId; // Get the quiz ID from the request parameters

    // Fetch the quiz by ID and populate scores with student details
    const quiz = await Quiz.findById(quizId)
      .populate("scores.studentId", "name email")
      .select("scores"); // Select only the scores field

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Return the scores array with full details
    const scoresDetails = quiz.scores.map((score) => ({
      studentId: score.studentId, // populated studentId object
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

exports.submitExam = async (req, res) => {
  try {
    const { quizId, userId } = req.params; // Get quiz ID and user ID from the request parameters
    const { userAnswers } = req.body; // Get user answers from request body

    // Find the quiz by ID
    const quiz = await Quiz.findById(quizId).populate("scores.studentId");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Check if the user has already submitted this quiz
    const alreadySubmitted = quiz.scores.some(
      (score) => score.studentId.toString() === userId
    );
    if (alreadySubmitted) {
      return res
        .status(400)
        .json({ message: "You have already submitted this quiz." });
    }

    // Calculate the score
    let obtainedMarks = 0;
    let passed = false; // Initialize passed as false
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer !== undefined) {
        const selectedOption = question.options[userAnswer];
        if (selectedOption && selectedOption.isCorrect) {
          obtainedMarks += question.marks; // Add marks for correct answer
        }
      }
    });

    // Example passing criteria: student must score at least 75% of total marks
    if (obtainedMarks >= quiz.totalMarks * 0.75) {
      passed = true;
    }

    // Save the score
    quiz.scores.push({
      studentId: userId,
      obtainedMarks,
      passed,
      examDate: new Date(),
    });

    await quiz.save();

    // Respond with the result
    res.status(200).json({
      message: "Exam submitted successfully.",
      obtainedMarks,
      totalMarks: quiz.totalMarks,
      passed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
exports.fetchScoresByUserId = async (req, res) => {
  const userId = req.params.userId; // Assuming userID is passed as a URL parameter

  try {
    const quizzes = await Quiz.find(
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
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params; // Change variable name to quizId
    const quiz = await Quiz.findById(quizId).populate("subject");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve quiz", error: error.message });
  }
};

// Delete a quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params; // Change variable name to quizId

    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);

    if (!deletedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete quiz", error: error.message });
  }
};

// Update an existing quiz
exports.editQuiz = async (req, res) => {
  const { quizId } = req.params; // Get quiz ID from the URL
  const updatedData = req.body; // Get updated data from the request body

  try {
    // Find and update the quiz by ID
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        ...updatedData, // Spread the updated data to replace fields
        updatedAt: Date.now(), // Update the 'updatedAt' field
      },
      { new: true, runValidators: true } // Return the updated document and validate the data
    );

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({ message: "Quiz updated successfully", updatedQuiz });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating quiz", error: error.message });
  }
};

exports.takeQuiz = async (req, res) => {
  try {
    const { quizId } = req.params; // Exam ID from URL

    const { answers, studentId } = req.body;

    // Fetch the quiz from the database
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Calculate the obtained marks
    let obtainedMarks = 0;
    quiz.questions.forEach((question, index) => {
      const answer = answers[index];
      const correctOption = question.options.find((option) => option.isCorrect);

      // Check if the student's answer matches the correct answer
      if (correctOption && correctOption.optionText === answer) {
        obtainedMarks += question.marks;
      }
    });

    // Determine if the student passed
    const passed = obtainedMarks >= quiz.passMarks;

    // Record the score
    quiz.scores.push({
      studentId,
      obtainedMarks,
      passed,
      examDate: new Date(),
    });

    // Save the updated quiz with the new score entry
    await quiz.save();

    res.status(200).json({
      message: "Quiz submitted successfully",
      obtainedMarks,
      totalMarks: quiz.totalMarks,
      passed,
    });
  } catch (error) {
    console.error("Error taking quiz:", error);
    res
      .status(500)
      .json({ message: "An error occurred while taking the quiz" });
  }
};

exports.checkIfUserHasTakenExam = async (req, res) => {
  try {
    const userId = req.body.userId;

    const quizId = req.params.quizId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const quiz = await Exam.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not Found" });
    }

    const hasTaken = quiz.scores.some(
      (score) => score.studentId.toString() === userId.toString()
    );

    if (hasTaken) {
      return res
        .status(200)
        .json({ message: "You have already taken this exam" });
    }

    return res
      .status(200)
      .json({ message: "You have not taken this exam yet" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
