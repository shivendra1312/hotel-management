const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const adminOrHotel = require("../Middleware/adminOrHotel");
const {
    createBooking,
    getMyBookings,
    getHotelBookings,
    confirmBooking,
    checkInBooking,
    completeBooking,
    cancelBooking,
    getBookedDates,
    getAllBookings,
} = require("../Controller/bookingController");

// User
router.post("/create", auth, createBooking);
router.get("/myBookings", auth, getMyBookings);
router.put("/cancel/:id", auth, cancelBooking);

// Public
router.get("/bookedDates/:roomId", getBookedDates);

// Hotel / Admin
router.get("/hotel/:hotelId", auth, adminOrHotel, getHotelBookings);
router.patch("/confirm/:id", auth, adminOrHotel, confirmBooking);
router.patch("/checkin/:id", auth, adminOrHotel, checkInBooking);
router.patch("/complete/:id", auth, adminOrHotel, completeBooking);
router.get("/all", auth, adminOrHotel, getAllBookings);

module.exports = router;
