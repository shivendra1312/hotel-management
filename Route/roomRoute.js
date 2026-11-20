const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const adminOrHotel = require("../Middleware/adminOrHotel");
const upload = require("../Middleware/upload");
const {
    createRoom,
    getRoomsByHotel,
    getAllRoomsByHotel,
    getRoomById,
    updateRoom,
    toggleRoom,
    toggleMaintenance,
    deleteRoom,
    bulkImportRooms,
} = require("../Controller/roomController");

// Public
router.get("/public/hotel/:hotelId", getRoomsByHotel);
router.get("/:id", getRoomById);

// Admin / Hotel
router.post("/create", auth, adminOrHotel, createRoom);
router.get("/all/hotel/:hotelId", auth, adminOrHotel, getAllRoomsByHotel);
router.patch("/update/:id", auth, adminOrHotel, updateRoom);
router.patch("/toggle/:id", auth, adminOrHotel, toggleRoom);
router.patch("/maintenance/:id", auth, adminOrHotel, toggleMaintenance);
router.delete("/delete/:id", auth, adminOrHotel, deleteRoom);
router.post("/bulkImport/:hotelId", auth, adminOrHotel, upload.single("file"), bulkImportRooms);

module.exports = router;
