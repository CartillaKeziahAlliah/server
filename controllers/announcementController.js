const { json } = require("express");
const Announcement = require("../models/Announcement");

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, section } = req.body;
    const { announcerId } = req.params;

    const newAnnouncement = new Announcement({
      title,
      content,
      announcer: announcerId,
      section,
    });

    await newAnnouncement.save();

    return res.status(201).json(newAnnouncement);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("announcer", "name avatar")
      .populate("section", "section_name");

    return res.status(200).json(announcements);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
    if (!deletedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    return res
      .status(200)
      .json({ message: "Announcement deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    return res.status(200).json(updatedAnnouncement);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Announcement.updateMany({ read: false }, { read: true });
    return res
      .status(200)
      .json({ message: "All announcements marked as read" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  markAsRead,
  markAllAsRead,
};
