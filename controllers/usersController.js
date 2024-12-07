const { json } = require("express");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Section = require("../models/Section"); // Adjust the path as needed
const Assignment = require("../models/Assignment");
const Exam = require("../models/Exam");
const Quiz = require("../models/Quiz");
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Error fetching user profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, password } = req.body;

    let updatedUserData = { name };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedUserData.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "profile_pictures",
          public_id: `${userId}_profile`,
        });
        updatedUserData.avatar = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading file to Cloudinary:", uploadError);
        return res.status(500).json({ error: "Error uploading file" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Error updating user profile" });
  }
};
exports.assignLRN = async (req, res) => {
  const { LRN } = req.body; // Get user ID and LRN from the request body
  const { userId } = req.params;
  try {
    // Check if the LRN is unique
    const existingUser = await User.findOne({ LRN });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "LRN already in use by another user" });
    }

    // Update the user with the provided LRN
    const user = await User.findByIdAndUpdate(
      userId,
      { LRN },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "LRN assigned successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to assign LRN to the user" });
  }
};

exports.addSectionToUser = async (req, res) => {
  try {
    const { userId, sectionId } = req.body;

    // Check if the section exists
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if section is already assigned to the user
    if (user.sections.includes(sectionId)) {
      return res.status(400).json({ message: "Section already added to user" });
    }

    user.sections.push(sectionId);
    await user.save();

    res
      .status(200)
      .json({ message: "Section added to user successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getUserScoresWithActivity = async (req, res) => {
  const { userId, subjectId } = req.params; 

  try {
    // Fetch assignments, exams, and quizzes for the specified userId and subjectId
    const assignments = await Assignment.find({
      "scores.studentId": userId,
      subject: subjectId,
    })
      .populate("subject", "subject_name") // Populate the subject name
      .lean();

    const exams = await Exam.find({
      "scores.studentId": userId,
      subject: subjectId,
    })
      .populate("subject", "subject_name") // Populate the subject name
      .lean();

    const quizzes = await Quiz.find({
      "scores.studentId": userId,
      subject: subjectId,
    })
      .populate("subject", "subject_name") // Populate the subject name
      .lean();

    // Map scores to include activity information for the specific subject
    const assignmentScores = assignments.map((assignment) => ({
      activity: {
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject.subject_name, // Use populated subject name
        duration: assignment.duration,
        totalMarks: assignment.totalMarks,
        passMarks: assignment.passMarks,
        deadline: assignment.deadline,
      },
      score: assignment.scores.find(
        (score) => score.studentId.toString() === userId
      ),
    }));

    const examScores = exams.map((exam) => ({
      activity: {
        title: exam.title,
        description: exam.description,
        subject: exam.subject.subject_name, // Use populated subject name
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passMarks: exam.passMarks,
      },
      score: exam.scores.find((score) => score.studentId.toString() === userId),
    }));

    const quizScores = quizzes.map((quiz) => ({
      activity: {
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject.subject_name, // Use populated subject name
        duration: quiz.duration,
        totalMarks: quiz.totalMarks,
        passMarks: quiz.passMarks,
        deadline: quiz.deadline,
      },
      score: quiz.scores.find((score) => score.studentId.toString() === userId),
    }));

    // Combine all scores for the specific subject into a single object
    const userScoresForSubject = {
      subject:
        assignments[0]?.subject.subject_name ||
        exams[0]?.subject.subject_name ||
        quizzes[0]?.subject.subject_name,
      assignments: assignmentScores,
      exams: examScores,
      quizzes: quizScores,
    };

    res.status(200).json(userScoresForSubject);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching scores for the specified subject",
      error,
    });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    // Find users where the role is "teacher"
    const teachers = await User.find({ role: "teacher" });

    // Return the results
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching teachers",
    });
  }
};
exports.getAllTeachersExlcudedinsection = async (req, res) => {
  try {
    const sectionId = req.params.sectionId; // Extract sectionId from params

    // Find the section by the provided sectionId and extract the teacher references
    const section = await Section.findById(sectionId).select("teacher");

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Get teacher IDs from the section
    const teacherIdsInSection = section.teacher;

    // Find all teachers who are NOT in this section's teacher array
    const teachers = await User.find({
      role: "teacher",
      _id: { $nin: teacherIdsInSection }, // Exclude teachers already in the section
    });

    // Return the results
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching teachers",
    });
  }
};
exports.updateUserRoleToMasterAdmin = async (req, res) => {
  try {
    const { userId } = req.params; // Extract user ID from the request parameters

    // Check if user ID is provided
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the user and update the role to masterAdmin
    const user = await User.findByIdAndUpdate(
      userId,
      { role: "masterAdmin" },
      { new: true, runValidators: true } // Return updated document and apply schema validations
    );

    // If the user is not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Success response
    res.status(200).json({
      message: "User role updated to masterAdmin successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      LRN: { $exists: true, $ne: null }, // Check if 'lrn' exists and is not null
    })
      .populate({
        path: "sections",
        select: "section_name grade_level",
      })
      .select("-password"); // Exclude sensitive fields like password

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};
exports.getStudentsWithoutLRN = async (req, res) => {
  try {
    const studentsWithoutLRN = await User.find({
      role: "student",
      $or: [{ LRN: { $exists: false } }, { LRN: null }, { LRN: "" }],
    });

    res.status(200).json({
      success: true,
      data: studentsWithoutLRN,
    });
  } catch (error) {
    console.error("Error fetching students without LRN:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch students.",
      error: error.message,
    });
  }
};
exports.addOrUpdateLRN = async (req, res) => {
  try {
    const { userId, LRN } = req.body;

    // Validate request data
    if (!userId || !LRN) {
      return res.status(400).json({
        success: false,
        message: "userId and LRN are required.",
      });
    }

    // Find and update the user
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, role: "student" }, // Ensure it's a student
      { LRN }, // Update the LRN
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Student not found or invalid role.",
      });
    }

    res.status(200).json({
      success: true,
      message: "LRN updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating LRN:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not update LRN.",
      error: error.message,
    });
  }
};
exports.addOrUpdateStudentSection = async (req, res) => {
  const { studentId, sectionId } = req.body;

  try {
    // Check if the section exists
    const newSection = await Section.findById(sectionId);
    if (!newSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Check if the student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove student from all current sections
    if (student.sections.length > 0) {
      const currentSections = student.sections;

      // Update all current sections to remove the student's ID
      await Section.updateMany(
        { _id: { $in: currentSections } },
        { $pull: { students: studentId } }
      );
    }

    // Update the student's sections array to only include the new section
    student.sections = [sectionId];
    await student.save();

    // Add the student to the new section's students array if not already present
    if (!newSection.students.includes(studentId)) {
      newSection.students.push(studentId);
      await newSection.save();
    }

    return res.status(200).json({
      message: "Student successfully moved to new section",
      section: newSection,
      student,
    });
  } catch (error) {
    console.error("Error updating student in section:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.getUserStatistics = async (req, res) => {
  try {
    // Define all possible roles and statuses
    const allRoles = ["student", "admin", "teacher", "masterAdmin"];
    const allStatuses = ["blocked", "Dropped", "Active"];

    // Get count of users by role
    const rolesCount = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Get count of users by status
    const statusCount = await User.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Initialize objects with default values
    const roles = allRoles.reduce((acc, role) => {
      acc[role] = 0; // Default count for each role is 0
      return acc;
    }, {});

    const statuses = allStatuses.reduce((acc, status) => {
      acc[status] = 0; // Default count for each status is 0
      return acc;
    }, {});

    // Fill in the actual counts for roles and statuses
    rolesCount.forEach((item) => {
      if (roles[item._id] !== undefined) {
        roles[item._id] = item.count;
      }
    });

    statusCount.forEach((item) => {
      if (statuses[item._id] !== undefined) {
        statuses[item._id] = item.count;
      }
    });

    // Structure the response
    const statistics = {
      roles,
      statuses,
    };

    res.status(200).json({ success: true, data: statistics });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
