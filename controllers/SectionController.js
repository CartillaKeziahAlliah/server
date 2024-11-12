const { json } = require("express");
const Section = require("../models/Section");
const addSection = async (req, res) => {
  try {
    const { section_name, grade_level, teacher, students } = req.body;

    const newSection = new Section({
      section_name,
      grade_level,
      teacher,
      students,
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

    const sections = await Section.find({ teacher: id });
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
const getStudentsInSection = async (req, res) => {
  const sectionId = req.params.id; // Get the section ID from request parameters

  try {
    const section = await Section.findById(sectionId).populate("students");

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    return res.status(200).json({
      sectionId: section._id,
      students: section.students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  addSection,
  getSectionById,
  getMySections,
  getStudentsInSection,
};
