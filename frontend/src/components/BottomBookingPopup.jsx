import React, { useState, useEffect } from "react";
import "../styles/BottomBookingPopup.css";

const BottomBookingPopup = ({
  room,
  date,
  slotInfo,
  onClose,
  onConfirm,
  onCancelBooking,
}) => {
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState("");

  const isCancelMode = !!slotInfo?._id; // bookingId exists -> cancel mode

  useEffect(() => {
    setCapacity("");
    setError("");
  }, [slotInfo]);

  const handleBook = () => {
    const num = Number(capacity);
    if (isNaN(num) || num <= 0) {
      return setError("Please enter a number greater than 0");
    }
    if (num > room.capacity) {
      return setError(`Max capacity is ${room.capacity}`);
    }

    onConfirm(num);
  };

  if (!slotInfo) return null;

  return (
    <div className="bottom-popup-overlay">
      <div className="bottom-popup">
        <h3>{isCancelMode ? "Cancel Booking" : "Confirm Booking"}</h3>
        <p>
          <strong>Room:</strong> {room.name}
        </p>
        <p>
          <strong>Date:</strong> {date}
        </p>
        <p>
          <strong>Time:</strong> {slotInfo.startTimeStr} - {slotInfo.endTimeStr}
        </p>

        {!isCancelMode && (
          <>
            <label>
              <strong>Attendees (max {room.capacity}):</strong>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="popup-input"
                placeholder="Enter number of people"
                min="1"
                max={room.capacity}
              />
            </label>
            {error && <p className="popup-error">{error}</p>}
          </>
        )}

        <div className="popup-actions">
          {isCancelMode ? (
            <button
              className="confirm-btn"
              style={{ backgroundColor: "red" }}
              onClick={onCancelBooking}
            >
              Cancel Booking
            </button>
          ) : (
            <button className="confirm-btn" onClick={handleBook}>
              Book Now
            </button>
          )}
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomBookingPopup;
