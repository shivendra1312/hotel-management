const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const admin = require("../Middleware/admin");
const superAdmin = require("../Middleware/superAdmin");
const adminOrHotel = require("../Middleware/adminOrHotel");
const {
    getHotelDashboard,
    getAdminDashboard,
    getPlatformAnalytics,
    exportHotelBookings,
    exportAllUsers,
} = require("../Controller/dashboardController");

router.get("/hotel/:hotelId", auth, adminOrHotel, getHotelDashboard);
router.get("/admin", auth, admin, getAdminDashboard);
router.get("/platform", auth, superAdmin, getPlatformAnalytics);
router.get("/export/bookings/:hotelId", auth, adminOrHotel, exportHotelBookings);
router.get("/export/users", auth, superAdmin, exportAllUsers);

module.exports = router;
