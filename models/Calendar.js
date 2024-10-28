const mongoose = require("mongoose");

const calendarSchema = new mongoose.Schema({
  event_title: { type: String, required: true },
  event_datetime: { type: Date, required: true },
  note: { type: String },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
});

module.exports = mongoose.model("Calendar", calendarSchema);
