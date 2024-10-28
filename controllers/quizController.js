const Quiz = require("../models/Quiz"); // Update model import to Quiz
const Subject = require("../models/Subject");

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
      deadline, // Save the deadline
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
