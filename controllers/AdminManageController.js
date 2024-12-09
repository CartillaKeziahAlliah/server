const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Section = require("../models/Section"); // Assuming the path to the Section model
const Subject = require("../models/Subject"); // Assuming the path to the Subject model
const mongoose = require("mongoose");

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select(
      "name email avatar status"
    );
    res.status(200).json({
      success: true,
      message: "Teachers retrieved successfully",
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving teachers",
      error: error.message,
    });
  }
};

exports.addInstructor = async (req, res) => {
  try {
    const { email, password, name, username, idNumber } = req.body;

    // Check if the instructor email already exists
    const existingInstructorByEmail = await User.findOne({ email });
    if (existingInstructorByEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Check if the username already exists
    const existingInstructorByUsername = await User.findOne({ username });
    if (existingInstructorByUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check if the ID number already exists
    const existingInstructorByIdNumber = await User.findOne({ idNumber });
    if (existingInstructorByIdNumber) {
      return res.status(400).json({ error: "ID number already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create a new instructor
    const newInstructor = new User({
      name,
      email,
      username, // Save the username
      idNumber, // Save the ID number
      password: hashedPassword, // Store the hashed password
      role: "teacher", // Set role to teacher for new instructor
    });

    // Save the instructor
    await newInstructor.save();
    return res
      .status(201)
      .json({ message: "Instructor added successfully", data: newInstructor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "blocked" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User blocked successfully", data: user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error blocking user", error: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "Active" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User unblocked successfully", data: user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error unblocking user", error: error.message });
  }
};

// admin
exports.getAdmins = async (req, res) => {
  try {
    // Query to fetch users with role "admin" or "masterAdmin"
    const admins = await User.find({ role: { $in: ["admin", "masterAdmin"] } });

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin users",
      error: error.message,
    });
  }
};

exports.removeAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the user with the specified ID and roles
    const deletedUser = await User.findOneAndDelete({
      _id: id,
      role: { $in: ["admin", "masterAdmin"] },
    });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Admin or Master Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User removed successfully",
      data: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove user",
      error: error.message,
    });
  }
};

exports.addAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate role
    if (!["admin", "masterAdmin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles: admin, masterAdmin",
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new admin/masterAdmin
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Admin or Master Admin added successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add user",
      error: error.message,
    });
  }
};

// subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate(
        "teacher",
        "name" // Replace 'name' with the actual field name for the teacher's name
      )
      .populate(
        "section",
        "section_name" // Replace 'name' with the actual field name for the section's name
      );

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subjects", error });
  }
};

// Controller to update a subject

// Controller to delete a subject
exports.deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Subject deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subject", error });
  }
};
exports.addSubject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { subject_name, teacherId, sectionId } = req.body;

    // Validate section
    const section = sectionId ? await Section.findById(sectionId) : null;
    if (sectionId && !section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Validate teacher
    const teacher = teacherId ? await User.findById(teacherId) : null;
    if (teacherId && !teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Create a new subject
    const newSubject = new Subject({
      subject_name,
      teacher: teacher ? teacher._id : null,
      section: section ? section._id : null,
    });

    // Save the subject
    await newSubject.save({ session });

    // Update relationships if section and teacher are provided
    if (section && teacher) {
      // Update section's teacher array
      if (!section.teacher.some((id) => id.equals(teacher._id))) {
        section.teacher.push(teacher._id);
        await section.save({ session });
        console.log("Updated section teacher array:", section.teacher);
      }

      // Update teacher's sections array
      if (!teacher.sections.some((id) => id.equals(section._id))) {
        teacher.sections.push(section._id);
        await teacher.save({ session });
        console.log("Updated teacher sections array:", teacher.sections);
      }
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Return success response
    return res
      .status(201)
      .json({ message: "Subject created successfully", subject: newSubject });
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    console.error("Error in addSubject:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const {
      subject_name,
      teacher: newTeacherId,
      section: newSectionId,
    } = req.body;

    // Find the existing subject
    const existingSubject = await Subject.findById(req.params.id);
    if (!existingSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Extract current relationships
    const currentSectionId = existingSubject.section?.toString();
    const currentTeacherId = existingSubject.teacher?.toString();

    // Update the subject details
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { subject_name, teacher: newTeacherId, section: newSectionId },
      { new: true }
    );

    // Handle adding the teacher to the new section
    if (newSectionId && newTeacherId) {
      const newSection = await Section.findById(newSectionId);
      const newTeacher = await User.findById(newTeacherId);

      if (newSection) {
        // Ensure the teacher is in the new section's teacher array
        if (!newSection.teacher.some((id) => id.toString() === newTeacherId)) {
          newSection.teacher.push(newTeacherId);
        }
        await newSection.save();
      }

      if (newTeacher) {
        // Ensure the new section is in the teacher's sections array, without duplicates
        if (!newTeacher.sections.some((id) => id.toString() === newSectionId)) {
          newTeacher.sections.push(newSectionId);
        }
        await newTeacher.save();
      }
    }

    // Ensure existing associations are preserved
    if (currentSectionId && currentTeacherId) {
      const currentSection = await Section.findById(currentSectionId);
      const currentTeacher = await User.findById(currentTeacherId);

      if (currentSection) {
        // Ensure the current teacher is in the section's teacher array, without duplicates
        if (!currentSection.teacher.includes(currentTeacherId)) {
          currentSection.teacher.push(currentTeacherId);
          await currentSection.save();
        }
      }

      if (currentTeacher) {
        // Ensure the current section is in the teacher's sections array, without duplicates
        if (!currentTeacher.sections.includes(currentSectionId)) {
          currentTeacher.sections.push(currentSectionId);
          await currentTeacher.save();
        }
      }
    }

    // Return success response
    res
      .status(200)
      .json({ message: "Subject updated successfully", updatedSubject });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating subject", error: error.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "An error occurred", error });
  }
};
