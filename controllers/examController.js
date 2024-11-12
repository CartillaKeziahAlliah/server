const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const mongoose = require("mongoose");

// Create a new exam
exports.createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      questions,
      duration,
      totalMarks,
      passMarks,
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

    // Validate exam properties
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

    // Create the new exam
    const newExam = new Exam({
      title,
      description,
      subject,
      questions,
      duration,
      totalMarks,
      passMarks,
    });

    // Save the exam to the database
    const savedExam = await newExam.save();
    res
      .status(201)
      .json({ message: "Exam created successfully", exam: savedExam });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create exam", error: error.message });
  }
};

// Retrieve all exams by subjectId
exports.getExamsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const exams = await Exam.find({ subject: subjectId })
      .populate("subject", "subject_name teacher section")
      .populate("scores.studentId");

    if (!exams) {
      return res
        .status(404)
        .json({ message: "No exams found for this subject" });
    }

    res.status(200).json(exams);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve exams", error: error.message });
  }
};

// Retrieve a single exam by ID
exports.getExamById = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId).populate("subject");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(exam);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve exam", error: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete exam", error: error.message });
  }
};
// Update an existing exam
exports.editExam = async (req, res) => {
  const { examId } = req.params; // Get exam ID from the URL
  const updatedData = req.body; // Get updated data from the request body

  try {
    // Find and update the exam by ID
    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      {
        ...updatedData, // Spread the updated data to replace fields
        updatedAt: Date.now(), // Update the 'updatedAt' field
      },
      { new: true, runValidators: true } // Return the updated document and validate the data
    );

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({ message: "Exam updated successfully", updatedExam });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating exam", error: error.message });
  }
};
exports.getExamScores = async (req, res) => {
  try {
    const examId = req.params.examId;

    // Find the exam by ID and populate student details in scores
    const exam = await Exam.findById(examId)
      .populate("scores.studentId", "name email") // populate only name and email
      .select("scores");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Map scores to only include the required details
    const scoresDetails = exam.scores.map((score) => ({
      studentId: score.studentId,
      obtainedMarks: score.obtainedMarks,
      passed: score.passed,
      examDate: score.examDate,
    }));

    res.json(scoresDetails); // Send the detailed scores
  } catch (error) {
    console.error("Error fetching exam scores:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.takeExam = async (req, res) => {
  try {
    const { examId } = req.params; 
    const { studentId, answers } = req.body; 

    const exam = await Exam.findById(examId).exec();
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    let obtainedMarks = 0;

    // If answers are provided, process them
    if (Array.isArray(answers) && answers.length === exam.questions.length) {
      exam.questions.forEach((question, index) => {
        const studentAnswer = answers[index]; // Assuming answers array matches question array order

        // Ensure that studentAnswer is a number and within bounds of question.options array
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

    // Check if the student passed or failed
    const passed = obtainedMarks >= exam.passMarks;

    // Update the exam with the new score for this student
    exam.scores.push({
      studentId: new mongoose.Types.ObjectId(studentId), // Fixed instantiation here
      obtainedMarks,
      passed,
      examDate: new Date(),
    });

    // Save the updated exam document
    await exam.save();

    // Send response to the student
    return res.json({
      message: "Exam completed successfully",
      obtainedMarks,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      passed,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while taking the exam" });
  }
};

exports.checkIfUserHasTakenExam = async (req, res) => {
  try {
    // Get the user ID from the request body
    const userId = req.body.userId; // Make sure that the userId is included in the request body

    // Get the exam ID from the request parameters
    const examId = req.params.examId;

    // Validate that userId is provided in the request body
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the exam by its ID and check if the user has already taken it
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Check if the user has already taken the exam by checking the `scores` array
    const hasTaken = exam.scores.some(
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
    return res.status(500).json({ message: "Server error" });
  }
};
