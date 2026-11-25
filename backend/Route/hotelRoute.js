const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const admin = require("../Middleware/admin");
const superAdmin = require("../Middleware/superAdmin");
const adminOrSuperAdmin = require("../Middleware/adminOrSuperAdmin");
const {
    createHotel,
    getAllPublicHotels,
    getPublicHotelById,
    getAdminHotels,
    getAllHotels,
    approveHotel,
    rejectHotel,
    updateHotel,
    toggleHotelStatus,
    getPendingHotels,
} = require("../Controller/hotelController");

// Public
router.get("/public/all", getAllPublicHotels);
router.get("/public/:id", getPublicHotelById);

// Admin
router.post("/create", auth, admin, createHotel);
router.get("/admin/myHotels", auth, admin, getAdminHotels);
router.patch("/update/:id", auth, admin, updateHotel);

// SuperAdmin
router.get("/all", auth, superAdmin, getAllHotels);
router.get("/pending", auth, superAdmin, getPendingHotels);
router.patch("/approve/:id", auth, superAdmin, approveHotel);
router.patch("/reject/:id", auth, superAdmin, rejectHotel);

// Admin or SuperAdmin
router.patch("/toggle/:id", auth, adminOrSuperAdmin, toggleHotelStatus);

module.exports = router;
