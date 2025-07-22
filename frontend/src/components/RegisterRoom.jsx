import React from "react";
import "../styles/RegisterRooms.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { getTodayDate } from "../utils/Helpers";

const RegisterRoom = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const today = getTodayDate(); // IST date in YYYY-MM-DD

    // Convert input time to epoch seconds (use your existing helper logic)
    const startTime = Math.floor(
      new Date(`${today}T${data.startTime}:00+05:30`).getTime() / 1000
    );
    const endTime = Math.floor(
      new Date(`${today}T${data.endTime}:00+05:30`).getTime() / 1000
    );

    const requestBody = {
      name: data.name,
      type: data.type,
      slotSize: Number(data.slotSize),
      meetingSize: Number(data.meetingSize),
      capacity: Number(data.capacity),
      startTime,
      endTime,
    };

    try {
      await axios.post("http://localhost:5000/api/room/register", requestBody);
      alert("Room registered successfully!");
      reset();
    } catch (error) {
      alert(error.response?.data?.msg || "Room registration failed");
    }
  };

  return (
    <div className="register-room-container">
      <h2>Register New Room</h2>
      <form className="register-room-form" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Room Name
          <input
            type="text"
            {...register("name", { required: true })}
            placeholder="e.g. Meetingroom 4"
          />
          {errors.name && <span className="error">Room name is required</span>}
        </label>

        <label>
          Room Type
          <input
            type="text"
            {...register("type", { required: true })}
            placeholder="e.g. meeting, classroom, training..."
          />
          {errors.type && <span className="error">Room type is required</span>}
        </label>

        <label>
          Slot Size (in minutes)
          <input
            type="number"
            {...register("slotSize", { required: true, min: 1 })}
            placeholder="e.g. 15"
          />
          {errors.slotSize && (
            <span className="error">Enter slot size in minutes</span>
          )}
        </label>

        <label>
          Meeting Size (in minutes)
          <input
            type="number"
            {...register("meetingSize", { required: true, min: 1 })}
            placeholder="e.g. 30"
          />
          {errors.meetingSize && (
            <span className="error">Enter meeting size in minutes</span>
          )}
        </label>

        <label>
          Capacity
          <input
            type="number"
            {...register("capacity", { required: true, min: 1 })}
            placeholder="e.g. 5"
          />
          {errors.capacity && <span className="error">Enter max capacity</span>}
        </label>

        <label>
          Start Time (24hr IST)
          <input
            type="time"
            {...register("startTime", { required: true })}
            step="60"
            placeholder="09:00"
          />
          {errors.startTime && (
            <span className="error">Start time is required</span>
          )}
        </label>

        <label>
          End Time (24hr IST)
          <input
            type="time"
            {...register("endTime", { required: true })}
            step="60"
            placeholder="18:00"
          />
          {errors.endTime && (
            <span className="error">End time is required</span>
          )}
        </label>

        <button type="submit" className="register-btn">
          Register Room
        </button>
      </form>
    </div>
  );
};

export default RegisterRoom;
