const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;

const express = require("express");
const cors = require("cors");
const { connectDb } = require("./config/db.config");
const app = express();
const roomRoutes = require("./route/room.route");
const bookingRoutes = require("./route/book.route");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb();

app.use("/api/room", roomRoutes);
app.use("/api/booking", bookingRoutes);

app.listen(PORT, () => {
  console.log(`SERVER LISTENING ON PORT: ${PORT}`);
});

module.exports = app;
