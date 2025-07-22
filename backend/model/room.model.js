const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  slotSize: { type: Number, required: true },
  meetingSize: { type: Number, required: true },
  capacity: { type: Number, required: true },
  qrCode: { type: String },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
});

module.exports = mongoose.model("Room", roomSchema);
