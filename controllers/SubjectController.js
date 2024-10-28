const Subject = require("../models/Subject");
const User = require("../models/User");
const Section = require("../models/Section");
const { json } = require("express");

const addSubject = async (req, res) => {
  try {
    const { subject_name, teacher, section, start_time, end_time, schedule } =
      req.body;

    if (
      !subject_name ||
      !teacher ||
      !section ||
      !start_time ||
      !end_time ||
      !schedule
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const teacherExists = await User.findById(teacher);
    if (!teacherExists) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const sectionExists = await Section.findById(section);
    if (!sectionExists) {
      return res.status(404).json({ error: "Section not found" });
    }

    const newSubject = new Subject({
      subject_name,
      teacher,
      section,
      start_time,
      end_time,
      schedule,
    });

    const savedSubject = await newSubject.save();

    return res.status(201).json(savedSubject);
  } catch (error) {
    console.error("Error adding subject:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getAllSubjectsByTeacherId = async (req, res) => {
  const teacherId = req.params.teacherId;

  try {
    const subjects = await Subject.find({ teacher: teacherId }).populate(
      "section"
    );

    if (!subjects.length) {
      return res
        .status(404)
        .json({ message: "No subjects found for this teacher." });
    }

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
const getSubjectsBySectionId = async (req, res) => {
  const { sectionId } = req.params; // Assuming sectionId is passed as a URL parameter

  try {
    // Find subjects that match the sectionId
    const subjects = await Subject.find({ section: sectionId })
      .populate("teacher", "name avatar")
      .exec();

    if (!subjects.length) {
      return res
        .status(404)
        .json({ message: "No subjects found for this section." });
    }

    return res.status(200).json(subjects);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error.", error: error.message });
  }
};
module.exports = {
  addSubject,
  getAllSubjectsByTeacherId,
  getSubjectsBySectionId,
};
