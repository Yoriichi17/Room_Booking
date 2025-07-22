const roomControllers = require("../controller/room.controller");
const express = require("express");
const router = express.Router();

router.post("/register", roomControllers.registerRoom);
router.get("/fetch", roomControllers.getRoomDetails);

module.exports = router;
