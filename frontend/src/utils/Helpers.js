// Converts epoch seconds to HH:mm string format in IST
export const epochToISTTimeString = (epochSec) => {
  const date = new Date(epochSec * 1000); // Convert seconds to JS date
  date.setMinutes(date.getMinutes() + 330); // Add 5:30 offset for IST
  return date.toISOString().substr(11, 5); // Extract HH:mm from ISO string
};

// Converts time string "HH:mm" to minutes (for comparing or sorting)
export const timeStrToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// Adds N minutes to a time string (HH:mm) and returns new HH:mm string
export const addMinutesToTime = (timeStr, mins) => {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  const hour = Math.floor(total / 60);
  const min = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
};

// Groups an array of time strings ["09:00", "09:15", "10:00"] by hour
export const groupSlotsByHour = (slots) => {
  const grouped = {};
  for (const slot of slots) {
    const hour = slot.split(":")[0]; // Extract hour part
    if (!grouped[hour]) grouped[hour] = [];
    grouped[hour].push(slot);
  }

  // Optional: sort each hour's slots by time
  for (let hour in grouped) {
    grouped[hour].sort((a, b) => timeStrToMinutes(a) - timeStrToMinutes(b));
  }

  return grouped; // → { "09": ["09:00", "09:15"], "10": ["10:00"] }
};

// Returns today’s date in "YYYY-MM-DD" (in IST), used for UI && conversions
export const getTodayDate = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 330); // IST offset
  return now.toISOString().split("T")[0]; // Return YYYY-MM-DD only
};

// Check if a slot time (HH:mm) on a given date is in the past (compared to now)
export const isSlotInPast = (slotStr, selectedDate) => {
  const now = new Date(); // Current system time
  const [h, m] = slotStr.split(":").map(Number);
  const slotTime = new Date(
    `${selectedDate}T${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:00+05:30`
  );
  return slotTime < now;
};

// Gets current slotStr (e.g. "12:30") using current IST and slotSize
export const getNextISTSlotString = (slotSize) => {
  const now = new Date();

  const options = {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  };

  const istTime = new Intl.DateTimeFormat("en-IN", options).format(now); // ex: "12:47"
  let [hours, minutes] = istTime.split(":").map(Number);

  //  round UP to next slot
  let rounded = Math.ceil(minutes / slotSize) * slotSize;

  if (rounded >= 60) {
    // roll to next hour
    rounded = 0;
    hours = (hours + 1) % 24;
  }

  const hStr = String(hours).padStart(2, "0");
  const mStr = String(rounded).padStart(2, "0");

  const slotStr = `${hStr}:${mStr}`;
  console.log(`🕐 Current IST: ${istTime} → Next Slot: ${slotStr}`);
  return slotStr;
};
