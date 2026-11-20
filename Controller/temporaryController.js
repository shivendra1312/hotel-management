const Temporary = require("../Model/temporaryModel");
const Room = require("../Model/roomsModel");
const Booking = require("../Model/bookingModel");

// POST /temporary/hold
const holdRoom = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut } = req.body;
        const userId = req.user._id;

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate >= checkOutDate) {
            return res.status(400).json({ message: "Check-out date, check-in se baad honi chahiye" });
        }

        // Room exist karta hai?
        const room = await Room.findById(roomId);
        if (!room || !room.isActive || room.isInMaintenance) {
            return res.status(400).json({ message: "Room available nahi hai" });
        }

        // Pehle se koi hold hai is room par?
        const existingHold = await Temporary.findOne({ roomId });
        if (existingHold && existingHold.userId.toString() !== userId.toString()) {
            return res.status(409).json({ message: "Room already hold mein hai" });
        }

        // Existing booking overlap check
        const overlap = await Booking.findOne({
            roomId,
            status: { $in: ["Pending", "Confirmed", "CheckedIn"] },
            $or: [
                { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
            ],
        });

        if (overlap) {
            return res.status(409).json({ message: "Yeh dates already booked hain" });
        }

        // Purana hold hata do (same user ka) aur naya banao
        await Temporary.deleteOne({ roomId, userId });

        const hold = await Temporary.create({ roomId, userId, checkIn: checkInDate, checkOut: checkOutDate });

        res.status(201).json({ message: "Room 10 minute ke liye hold ho gaya", hold });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /temporary/check/:roomId
const checkHold = async (req, res) => {
    try {
        const hold = await Temporary.findOne({ roomId: req.params.roomId });
        res.status(200).json({ isHeld: !!hold, hold });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /temporary/release/:roomId
const releaseHold = async (req, res) => {
    try {
        await Temporary.deleteOne({ roomId: req.params.roomId, userId: req.user._id });
        res.status(200).json({ message: "Hold release ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { holdRoom, checkHold, releaseHold };
