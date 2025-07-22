const Room = require("../model/room.model");
const Book = require("../model/book.model");

exports.getBookingsByDate = async (req, res) => {
  try {
    const { date, roomId } = req.query;

    if (!date) {
      return res.status(400).json({ msg: "Date is required" });
    }

    // Convert to date range (00:00 to 23:59 of the day)
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const query = {
      date: { $gte: dayStart, $lte: dayEnd },
    };

    if (roomId) {
      query.roomId = roomId;
    }

    const bookings = await Book.find(query).populate("roomId");

    return res
      .status(200)
      .json({ msg: "Bookings fetched successfully", bookings });
  } catch (error) {
    console.error("Error fetching bookings by date:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { roomId, date, startTime, capacity } = req.body;

    // Validate room existence
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Validate capacity
    if (capacity > room.capacity) {
      return res
        .status(400)
        .json({ message: "Booking capacity exceeds room capacity" });
    }

    // Calculate meeting duration in minutes and derive endTime
    const meetingDuration = room.meetingSize; // in minutes
    const endTime = startTime + meetingDuration * 60; // convert minutes to seconds

    // Check for booking conflicts on the same date and room
    const conflict = await Book.findOne({
      roomId,
      date: new Date(date),
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return res.status(409).json({ message: "Time slot already booked" });
    }

    // Create the booking
    const booking = await Book.create({
      roomId,
      date: new Date(date),
      startTime,
      endTime,
      capacity,
    });

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const trimmedId = id.trim();
  try {
    const deletedBooking = await Book.findByIdAndDelete(trimmedId);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res
      .status(200)
      .json({ message: "Booking cancelled successfully", deletedBooking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while cancelling booking", error });
  }
};
