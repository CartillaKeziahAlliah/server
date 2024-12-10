const Calendar = require("../models/Calendar");

exports.getEventsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const events = await Calendar.find({
      event_datetime: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error });
  }
};

exports.addEvent = async (req, res) => {
  try {
    const { event_title, event_date, event_time, note, student } = req.body;

    // Validate input
    if (!event_title || !event_date || !event_time) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Parse event_time
    const [hours, minutes] = event_time.split(":").map(Number); // Ensure hours and minutes are numbers
    if (isNaN(hours) || isNaN(minutes)) {
      return res.status(400).json({ message: "Invalid time format" });
    }

    // Combine event_date and event_time into a Date object
    const eventDateTime = new Date(event_date);
    eventDateTime.setHours(hours, minutes, 0, 0); // Set hours, minutes, seconds, and milliseconds

    // Create a new event
    const newEvent = new Calendar({
      event_title,
      event_datetime: eventDateTime,
      note,
      student,
    });

    // Save to database
    await newEvent.save();

    res.status(201).json({ message: "Event added successfully", newEvent });
  } catch (error) {
    console.error("Error adding event:", error);
    res
      .status(500)
      .json({ message: "Error adding event", error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Calendar.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Event deleted successfully", deletedEvent });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event", error });
  }
};

exports.editEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_title, event_date, event_time, note, student } = req.body;

    const [hours, minutes] = event_time.split(":");
    const eventDateTime = new Date(event_date);
    eventDateTime.setHours(hours);
    eventDateTime.setMinutes(minutes);
    eventDateTime.setSeconds(0);

    const updatedEvent = await Calendar.findByIdAndUpdate(
      id,
      {
        event_title,
        event_datetime: eventDateTime,
        note,
        student,
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Event updated successfully", updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event", error });
  }
};
