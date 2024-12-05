const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Section = require("../models/Section"); // Assuming the path to the Section model
const Subject = require("../models/Subject"); // Assuming the path to the Subject model

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
    const { email, password, name } = req.body;

    // Check if the instructor already exists
    const existingInstructor = await User.findOne({ email });
    if (existingInstructor) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create a new instructor
    const newInstructor = new User({
      name,
      email,
      password: hashedPassword, // Store the hashed password
      role: "teacher", // set role to teacher for new instructor
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
exports.updateSubject = async (req, res) => {
  try {
    const { subject_name, teacher, section } = req.body;
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { subject_name, teacher, section },
      { new: true }
    );

    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(500).json({ message: "Error updating subject", error });
  }
};

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
  try {
    // Destructure the request body to get subject details
    const { subject_name, teacherId, sectionId } = req.body;

    // Check if the section exists
    const section = sectionId ? await Section.findById(sectionId) : null;
    if (sectionId && !section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Check if the teacher exists
    const teacher = teacherId ? await User.findById(teacherId) : null;
    if (teacherId && !teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Create a new Subject
    const newSubject = new Subject({
      subject_name,
      teacher: teacher ? teacher._id : null,
      section: section ? section._id : null,
    });

    // Save the new subject to the database
    await newSubject.save();

    // Return the created subject
    return res
      .status(201)
      .json({ message: "Subject created successfully", subject: newSubject });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
