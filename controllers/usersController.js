const { json } = require("express");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Section = require("../models/Section"); // Adjust the path as needed

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
    const { name, email, password } = req.body;

    let updatedUserData = { name, email };

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

    // Add the section to the user's sections array
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
