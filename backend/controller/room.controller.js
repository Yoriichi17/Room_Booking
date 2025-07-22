const Room = require("../model/room.model");

exports.registerRoom = async (req, res) => {
  try {
    const { name, type, slotSize, meetingSize, capacity, startTime, endTime } =
      req.body;

    // 1. Required fields
    if (
      !name ||
      !type ||
      !slotSize ||
      !meetingSize ||
      !capacity ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 2. Trim and normalize name/type
    const sanitizedName = name.trim();
    const sanitizedType = type.trim();

    // 3. Check if room already exists
    const existingRoom = await Room.findOne({ name: sanitizedName });
    if (existingRoom) {
      return res.status(400).json({ msg: "Meeting room name already exists" });
    }

    // 4. Validate start and end time
    if (startTime >= endTime) {
      return res
        .status(400)
        .json({ msg: "Start time must be less than end time" });
    }

    // 5. Validate slot and meeting sizes
    if (slotSize <= 0 || meetingSize <= 0 || capacity <= 0) {
      return res
        .status(400)
        .json({ msg: "All numeric values must be greater than 0" });
    }

    if (meetingSize % slotSize !== 0) {
      return res
        .status(400)
        .json({ msg: "Meeting size must be divisible by slot size" });
    }

    // 6. Validate number types
    if (![slotSize, meetingSize, capacity].every(Number.isInteger)) {
      return res
        .status(400)
        .json({
          msg: "Slot size, meeting size, and capacity must be integers",
        });
    }

    // ---------- CREATE AND SAVE ---------- //

    const newRoom = await Room.create({
      name: sanitizedName,
      type: sanitizedType,
      slotSize,
      meetingSize,
      capacity,
      startTime,
      endTime,
    });

    // Generate QR code reference (simple pattern)
    const qrCodeData = `room:${newRoom._id}`;
    newRoom.qrCode = qrCodeData;

    await newRoom.save();

    return res
      .status(201)
      .json({ msg: "Room registered successfully", room: newRoom });
  } catch (error) {
    console.log("Error while registering room:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

exports.getRoomDetails = async (req, res) => {
  try {
    const rooms = await Room.find();
    res
      .status(200)
      .json({ msg: "All rooms fetched succesfully", rooms: rooms });
  } catch (error) {
    console.log("Error while fetching room details:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
