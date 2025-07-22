const bookControllers = require("../controller/book.controller");
const express = require("express");
const router = express.Router();

router.get("/fetch", bookControllers.getBookingsByDate);
router.post("/createBooking", bookControllers.createBooking);
router.delete("/cancel/:id", bookControllers.cancelBooking);

module.exports = router;
