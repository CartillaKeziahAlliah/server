const Subject = require("../models/Subject");
const User = require("../models/User");
const Section = require("../models/Section");
const { json } = require("express");

const addSubject = async (req, res) => {
  try {
    const { subject_name, teacher, section } = req.body;

    if (!subject_name || !teacher || !section) {
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

const getSubjectById = async (req, res) => {
  const { subjectId } = req.params;

  try {
    const subject = await Subject.findById(subjectId)
      .populate("teacher", "name avatar")
      .populate("section", "section_name");

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    return res.status(200).json(subject);
  } catch (error) {
    console.error("Error fetching subject by ID:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getStudentSubjects = async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const section = await Section.findOne({ students: studentId })
      .populate("students")
      .exec();

    if (!section) {
      return res
        .status(404)
        .json({ message: "Student does not belong to any section." });
    }

    // Get the section ID
    const sectionId = section._id;

    // Find all subjects associated with the found section
    const subjects = await Subject.find({ section: sectionId })
      .populate("teacher") // Optionally populate teacher details
      .exec();

    // Map the subjects to include the subject names
    const subjectDetails = subjects.map((subject) => ({
      subjectId: subject._id,
      subjectName: subject.subject_name, // Include subject name
      startTime: subject.start_time,
      endTime: subject.end_time,
      schedule: subject.schedule,
      teacher: subject.teacher, // Includes teacher details if populated
    }));

    return res.status(200).json({ section, subjects: subjectDetails });
  } catch (error) {
    console.error("Error fetching student subjects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  getSubjectById,
  addSubject,
  getAllSubjectsByTeacherId,
  getSubjectsBySectionId,
  getStudentSubjects,
};
