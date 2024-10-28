const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/CalendarController");

// Get events for a specific date
router.get("/events/:date", calendarController.getEventsByDate);

// Add a new event
router.post("/events", calendarController.addEvent);

// Delete an event by ID
router.delete("/events/:id", calendarController.deleteEvent);

// Edit an event by ID
router.put("/events/:id", calendarController.editEvent);

module.exports = router;
