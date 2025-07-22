const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  date: { type: Date, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  capacity: { type: Number, required: true },
});

module.exports = mongoose.model("Book", bookSchema);
