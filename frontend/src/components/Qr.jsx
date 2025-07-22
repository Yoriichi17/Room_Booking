import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "../styles/Qr.css";
import { Link } from "react-router-dom";
import { getNextISTSlotString } from "../utils/Helpers";

function Qr() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/room/fetch");
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        if (Array.isArray(data.rooms)) {
          const updatedRooms = data.rooms.map((room) => {
            const timeSlot = getNextISTSlotString(room.slotSize || 15);
            return {
              ...room,
              qrCode: `http://localhost:5173/book?room=${encodeURIComponent(
                room.name
              )}&time=${timeSlot}`,
            };
          });

          setRooms(updatedRooms);
          setError(null);
        } else {
          setRooms([]);
          setError("Invalid response from server");
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
        setError("Could not load rooms. Please try again.");
      }
    };

    // Start polling every 5 seconds
    fetchRooms(); // First load
    const intervalId = setInterval(fetchRooms, 5000); // Poll every 5 sec

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="qr-page">
      <h1 className="qr-title">Welcome to the Booking App</h1>
      <p className="qr-subtitle">
        Scan the QR code to book the respective room
      </p>
      <Link className="link-register" to="/registerRoom">
        Register a New Room
      </Link>
      {error && <p className="qr-error">{error}</p>}

      <div className="qr-container">
        {rooms.map((room) => (
          <div key={room._id} className="qr-box">
            <QRCodeCanvas value={room.qrCode} size={160} />
            <p className="qr-label">{room.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Qr;
