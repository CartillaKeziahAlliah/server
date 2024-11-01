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

const getStudentSubjects = async (req, res) => {
  const studentId = req.params.studentId; // Get student ID from route parameters

  try {
    // Find the section that the student belongs to
    const section = await Section.findOne({ students: studentId })
      .populate("students") // Optionally populate student details
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
  addSubject,
  getAllSubjectsByTeacherId,
  getSubjectsBySectionId,
  getStudentSubjects,
};
