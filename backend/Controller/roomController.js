const Room = require("../Model/roomsModel");
const Hotel = require("../Model/hotelModel");
const compressImage = require("../Utilities/imageCompression");
const uploadImage = require("../Utilities/Cloudinary");
const XLSX = require("xlsx");

// POST /room/create
const createRoom = async (req, res) => {
    try {
        const { hotelId, roomNumber, type, price, maxGuests, description, amenities } = req.body;

        // Check karo hotel exist karta hai ya nahi
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ message: "Hotel nahi mila" });

        // Images upload karo
        const imageUrls = [];
        if (req.files && req.files.images) {
            const imagesArray = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            for (const img of imagesArray) {
                const compressed = await compressImage(img.data);
                const url = await uploadImage(compressed);
                imageUrls.push(url);
            }
        }

        const room = await Room.create({
            hotelId, roomNumber, type, price, maxGuests, description,
            amenities: amenities ? amenities.split(",").map(a => a.trim()) : [],
            images: imageUrls,
        });

        res.status(201).json({ message: "Room ban gaya", room });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Yeh room number is hotel mein pehle se hai" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /room/public/hotel/:hotelId
const getRoomsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const rooms = await Room.find({ hotelId, isActive: true }).sort({ roomNumber: 1 });
        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /room/all/hotel/:hotelId (admin/hotel)
const getAllRoomsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const rooms = await Room.find({ hotelId }).sort({ roomNumber: 1 });
        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /room/:id
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate("hotelId", "name address");
        if (!room) return res.status(404).json({ message: "Room nahi mila" });
        res.status(200).json({ room });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /room/update/:id
const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const room = await Room.findByIdAndUpdate(id, updates, { new: true });
        if (!room) return res.status(404).json({ message: "Room nahi mila" });
        res.status(200).json({ message: "Room update ho gaya", room });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /room/toggle/:id
const toggleRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: "Room nahi mila" });
        room.isActive = !room.isActive;
        await room.save();
        res.status(200).json({ message: `Room ${room.isActive ? "active" : "inactive"} ho gaya` });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /room/maintenance/:id
const toggleMaintenance = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: "Room nahi mila" });
        room.isInMaintenance = !room.isInMaintenance;
        await room.save();
        res.status(200).json({ message: `Room maintenance ${room.isInMaintenance ? "on" : "off"} ho gaya` });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /room/delete/:id
const deleteRoom = async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Room delete ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /room/bulkImport/:hotelId
const bulkImportRooms = async (req, res) => {
    try {
        const { hotelId } = req.params;

        if (!req.file) return res.status(400).json({ message: "Excel file upload karo" });

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (!rows.length) return res.status(400).json({ message: "File empty hai" });

        const rooms = rows.map(row => ({
            hotelId,
            roomNumber: String(row.roomNumber),
            type: row.type,
            price: Number(row.price),
            maxGuests: Number(row.maxGuests),
            description: row.description || "",
        }));

        const result = await Room.insertMany(rooms, { ordered: false });
        res.status(201).json({ message: `${result.length} rooms import ho gaye` });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Kuch rooms duplicate hain", error: error.message });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createRoom,
    getRoomsByHotel,
    getAllRoomsByHotel,
    getRoomById,
    updateRoom,
    toggleRoom,
    toggleMaintenance,
    deleteRoom,
    bulkImportRooms,
};
