const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

    // // Ensure the user has the necessary role (admin or masterAdmin)
    // if (req.user.role !== "admin" && req.user.role !== "masterAdmin") {
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    // Find the user by ID and update their status to 'blocked'
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

    // // Ensure the user has the necessary role (admin or masterAdmin)
    // if (req.user.role !== "admin" && req.user.role !== "masterAdmin") {
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    // Find the user by ID and update their status to 'blocked'
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
