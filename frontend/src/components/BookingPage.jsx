import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "../styles/BookingPage.css";
import BottomBookingPopup from "./BottomBookingPopup";

import {
  epochToISTTimeString,
  timeStrToMinutes,
  addMinutesToTime,
  groupSlotsByHour,
  getTodayDate,
  isSlotInPast,
} from "../utils/Helpers";

const BookingPage = () => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [slotInfo, setSlotInfo] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchParams] = useSearchParams();
  const activeTabRef = useRef(null);
  const defaultSlotFromQR = searchParams.get("time");
  useEffect(() => {
    if (
      !defaultSlotFromQR ||
      !timeSlots.length ||
      !activeRoom ||
      selectedSlots.length > 0
    )
      return;

    const slotIndex = timeSlots.indexOf(defaultSlotFromQR);
    if (slotIndex === -1) return;

    const blockCount = activeRoom.meetingSize / activeRoom.slotSize;
    const blocks = [];

    for (
      let i = slotIndex;
      i < timeSlots.length && blocks.length < blockCount;
      i++
    ) {
      const slot = timeSlots[i];
      if (!isSlotBooked(slot) && !isSlotInPast(slot, selectedDate)) {
        blocks.push(slot);
      } else break;
    }

    if (blocks.length === blockCount) {
      const startStr = blocks[0];
      const endStr = addMinutesToTime(
        blocks[blockCount - 1],
        activeRoom.slotSize
      );

      const getEpochFromDateTime = (date, timeStr) =>
        Math.floor(new Date(`${date}T${timeStr}:00+05:30`).getTime() / 1000);

      const startTime = getEpochFromDateTime(selectedDate, startStr);
      const endTime = getEpochFromDateTime(selectedDate, endStr);

      setSelectedSlots(blocks);
      setSlotInfo({
        startTime,
        endTime,
        startTimeStr: startStr,
        endTimeStr: endStr,
      });
      setShowPopup(false);
    }
  }, [timeSlots, activeRoom, bookings]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("https://room-booking-rjpo.onrender.com/api/room/fetch");
        setRooms(res.data.rooms);

        const roomName = searchParams.get("room");

        // Only set activeRoom if not already set
        setActiveRoom((prevRoom) => {
          if (prevRoom) return prevRoom;

          const defaultRoom =
            res.data.rooms.find((r) => r.name === roomName) ||
            res.data.rooms[0];
          return defaultRoom;
        });
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };

    fetchRooms(); // Initial fetch only
  }, [searchParams]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!activeRoom || !selectedDate) return;
      try {
        const res = await axios.get(
          `https://room-booking-rjpo.onrender.com/api/booking/fetch?date=${selectedDate}&roomId=${activeRoom._id}`
        );
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };

    fetchBookings();
  }, [activeRoom, selectedDate]);

  useEffect(() => {
    if (!activeRoom) return;

    const start = epochToISTTimeString(activeRoom.startTime);
    const end = epochToISTTimeString(activeRoom.endTime);
    const slotSize = activeRoom.slotSize;
    const slots = [];

    let current = start;
    while (current < end) {
      slots.push(current);
      current = addMinutesToTime(current, slotSize);
    }

    slots.sort((a, b) => timeStrToMinutes(a) - timeStrToMinutes(b));
    setTimeSlots(slots);
  }, [activeRoom]);

  const isSlotBooked = (slotStr) => {
    return bookings.some((b) => {
      const start = epochToISTTimeString(b.startTime);
      const end = epochToISTTimeString(b.endTime);

      return slotStr >= start && slotStr < end;
    });
  };

  const handleSlotClick = (slotStr) => {
    if (isSlotInPast(slotStr, selectedDate)) return;

    const idx = timeSlots.indexOf(slotStr);
    const blockSize = activeRoom.meetingSize / activeRoom.slotSize;
    let blocks = [];

    // Find booking by comparing human-readable IST strings
    const booking = bookings.find((b) => {
      const bookingRoomId =
        typeof b.roomId === "object" ? b.roomId._id : b.roomId;
      const timeString = epochToISTTimeString(b.startTime);
      const timeStringEnd = epochToISTTimeString(b.endTime);
      return (
        bookingRoomId === activeRoom._id &&
        slotStr >= timeString &&
        slotStr < timeStringEnd
      );
    });

    if (booking) {
      setSelectedSlots([]);
      setSlotInfo({
        _id: booking._id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        startTimeStr: epochToISTTimeString(booking.startTime),
        endTimeStr: epochToISTTimeString(booking.endTime),
      });
      setShowPopup(true);
      return;
    }

    // For new bookings - fill required time slots
    for (let i = idx; i < timeSlots.length && blocks.length < blockSize; i++) {
      if (
        !isSlotBooked(timeSlots[i]) &&
        !isSlotInPast(timeSlots[i], selectedDate)
      ) {
        blocks.push(timeSlots[i]);
      } else break;
    }

    if (blocks.length < blockSize) {
      for (let i = idx - 1; i >= 0 && blocks.length < blockSize; i--) {
        if (
          !isSlotBooked(timeSlots[i]) &&
          !isSlotInPast(timeSlots[i], selectedDate)
        ) {
          blocks.unshift(timeSlots[i]);
        } else break;
      }
    }

    if (blocks.length === blockSize) {
      const startStr = blocks[0];
      const endStr = addMinutesToTime(
        blocks[blocks.length - 1],
        activeRoom.slotSize
      );

      // convert to full epoch seconds
      const getEpochFromDateTime = (date, timeStr) =>
        Math.floor(new Date(`${date}T${timeStr}:00+05:30`).getTime() / 1000);

      const startTime = getEpochFromDateTime(selectedDate, startStr);
      const endTime = getEpochFromDateTime(selectedDate, endStr);

      setSelectedSlots(blocks);
      setSlotInfo({
        startTime,
        endTime,
        startTimeStr: startStr,
        endTimeStr: endStr,
      });
      setShowPopup(true);
    } else {
      setSelectedSlots([]);
      setSlotInfo(null);
      setShowPopup(false);
    }
  };

  const handleConfirmBooking = async (enteredCapacity) => {
    if (!slotInfo || !activeRoom) return;
    try {
      const payload = {
        roomId: activeRoom._id,
        date: selectedDate,
        startTime: slotInfo.startTime,
        capacity: enteredCapacity,
      };
      const res = await axios.post(
        "https://room-booking-rjpo.onrender.com/api/booking/createBooking",
        payload
      );
      alert("Booking successful");
      setSelectedSlots([]);
      setSlotInfo(null);
      setShowPopup(false);
      setBookings([...bookings, res.data.booking]);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed");
    }
  };

  const handleCancelBooking = async () => {
    try {
      await axios.delete(
        `https://room-booking-rjpo.onrender.com/api/booking/cancel/${slotInfo._id}`
      );
      alert("Booking cancelled");
      setBookings(bookings.filter((b) => b._id !== slotInfo._id));
      setSlotInfo(null);
      setShowPopup(false);
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Cancel failed");
    }
  };

  const groupedSlots = groupSlotsByHour(timeSlots);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeRoom]);

  return (
    <div className="booking-page">
      <div className="navbar">
        {rooms.map((room) => (
          <button
            key={room._id}
            ref={activeRoom?._id === room._id ? activeTabRef : null}
            className={`tab ${activeRoom?._id === room._id ? "active" : ""}`}
            onClick={() => {
              setActiveRoom(room);
              setSelectedSlots([]);
              setSlotInfo(null);
              setShowPopup(false);
            }}
          >
            {room.name}
          </button>
        ))}
      </div>

      <input
        type="date"
        value={selectedDate}
        min={getTodayDate()}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setSelectedSlots([]);
          setSlotInfo(null);
          setShowPopup(false);
        }}
        className="date-picker"
      />

      <div className="slot-table">
        {Object.entries(groupedSlots)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([hour, slots]) => (
            <div key={hour} className="hour-row">
              <div className="hour-label">{`${hour}:00`}</div>
              <div className="hour-slots">
                {slots.map((slot) => {
                  const isBooked = isSlotBooked(slot);
                  const isSelected = selectedSlots.includes(slot);
                  const inPast = isSlotInPast(slot, selectedDate);
                  let classes = "slot";
                  if (inPast) classes += " disabled-slot";
                  else if (isBooked) classes += " booked";
                  else if (isSelected) classes += " selected";
                  else classes += " available";
                  return (
                    <div
                      key={slot}
                      className={classes}
                      onClick={() => handleSlotClick(slot)}
                    >
                      {slot}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Unified bottom popup for both create and cancel actions */}
      <BottomBookingPopup
        room={activeRoom}
        date={selectedDate}
        slotInfo={showPopup ? slotInfo : null}
        onClose={() => {
          setShowPopup(false);
          setSlotInfo(null);
          setSelectedSlots([]);
        }}
        onConfirm={handleConfirmBooking}
        onCancelBooking={handleCancelBooking}
      />
    </div>
  );
};

export default BookingPage;
