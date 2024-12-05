const Section = require("../models/Section");
const Assignment = require("../models/Assignment");
const Exam = require("../models/Exam");
const Quiz = require("../models/Quiz");
const addSection = async (req, res) => {
  try {
    const { section_name, grade_level, adviser } = req.body;

    // Check if the section name already exists
    const existingSection = await Section.findOne({ section_name });
    if (existingSection) {
      return res.status(400).json({
        message: "Section name already exists",
      });
    }

    // Create a new section if it doesn't exist
    const newSection = new Section({
      section_name,
      grade_level,
      adviser,
    });

    const savedSection = await newSection.save();

    return res.status(201).json({
      message: "Section added successfully",
      section: savedSection,
    });
  } catch (error) {
    console.error("Error adding section:", error);
    return res.status(500).json({
      message: "An error occurred while adding the section",
      error: error.message,
    });
  }
};

const getMySections = async (req, res) => {
  try {
    const { id } = req.params;

    // Find sections where the provided teacher ID is in the `teacher` array
    const sections = await Section.find({ teacher: { $in: [id] } });

    res.status(200).json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ message: "Error fetching sections" });
  }
};

const getSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id)
      .populate("teacher", "name avatar")
      .populate("students", "name avatar");

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.status(200).json(section);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const getStudentsInSectionWithPassingRates = async (req, res) => {
  const sectionId = req.params.id;

  try {
    // Find the section and populate students
    const section = await Section.findById(sectionId).populate("students");

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const studentIds = section.students.map((student) =>
      student._id.toString()
    );
    const userScores = {};

    // Helper function to process scores
    const processScores = (scores) => {
      scores.forEach((score) => {
        const { studentId, passed } = score;

        if (studentIds.includes(studentId.toString())) {
          if (!userScores[studentId]) {
            userScores[studentId] = { totalAttempts: 0, passedCount: 0 };
          }

          userScores[studentId].totalAttempts += 1;
          if (passed) {
            userScores[studentId].passedCount += 1;
          }
        }
      });
    };

    // Fetch and process Assignment, Exam, and Quiz scores
    const assignmentScores = await Assignment.find({}, "scores").lean();
    assignmentScores.forEach((assignment) => processScores(assignment.scores));

    const examScores = await Exam.find({}, "scores").lean();
    examScores.forEach((exam) => processScores(exam.scores));

    const quizScores = await Quiz.find({}, "scores").lean();
    quizScores.forEach((quiz) => processScores(quiz.scores));

    // Calculate passing percentage for each student in the section
    const studentsWithPassingRates = section.students.map((student) => {
      const studentId = student._id.toString();
      const { totalAttempts = 0, passedCount = 0 } =
        userScores[studentId] || {};

      const passingPercentage =
        totalAttempts > 0
          ? ((passedCount / totalAttempts) * 100).toFixed(2)
          : "0.00";

      return {
        ...student.toObject(),
        passingPercentage,
      };
    });

    return res.status(200).json({
      sectionId: section._id,
      students: studentsWithPassingRates,
    });
  } catch (error) {
    console.error("Error fetching students and passing rates:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
const getAllSections = async (req, res) => {
  try {
    const sections = await Section.find()
      .populate("teacher", "name avatar _id")
      .populate("students", "name avatar")
      .populate("adviser", "name avatar");
    res.status(200).json(sections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving sections" });
  }
};
const updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params; // Get the section ID from params
    const { section_name, adviser } = req.body; // Get the new section name and adviser from request body

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Update the section's name and adviser
    section.section_name = section_name || section.section_name;
    section.adviser = adviser || section.adviser;

    // Save the updated section
    await section.save();
    res.status(200).json({ message: "Section updated successfully", section });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller for deleting a section
const deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params; // Ensure param name matches the route

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Delete the section directly
    await Section.findByIdAndDelete(sectionId);

    res.status(200).json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Error deleting section:", error.message);
    res.status(500).json({
      message: "Server error while deleting the section.",
      error: error.message || "Unknown error",
    });
  }
};

const addTeacher = async (req, res) => {
  try {
    const { sectionId, userId } = req.params; // Get the sectionId and userId from params

    // Find the section by sectionId
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Check if the user is already in the teacher array
    if (section.teacher.includes(userId)) {
      return res.status(400).json({ message: "Teacher already added" });
    }

    // Add the userId to the teacher array
    section.teacher.push(userId);

    // Save the updated section
    await section.save();
    res.status(200).json({ message: "Teacher added successfully", section });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller for adding a student to a section
const addStudent = async (req, res) => {
  try {
    const { sectionId, userId } = req.params; // Get the sectionId and userId from params

    // Find the section by sectionId
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Check if the user is already in the students array
    if (section.students.includes(userId)) {
      return res.status(400).json({ message: "Student already added" });
    }

    // Add the userId to the students array
    section.students.push(userId);

    // Save the updated section
    await section.save();
    res.status(200).json({ message: "Student added successfully", section });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  updateSection,
  deleteSection,
  getAllSections,
  addSection,
  getSectionById,
  getMySections,
  getStudentsInSectionWithPassingRates,
  addTeacher,
  addStudent,
};
