const Booking = require("../Model/bookingModel");
const Room = require("../Model/roomsModel");
const Coupon = require("../Model/couponModel");
const Temporary = require("../Model/temporaryModel");
const dayjs = require("dayjs");

// POST /booking/create
const createBooking = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut, guests, couponCode, specialRequests } = req.body;
        const userId = req.user._id;

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate >= checkOutDate) {
            return res.status(400).json({ message: "Check-out date, check-in se baad honi chahiye" });
        }

        // Room details lo
        const room = await Room.findById(roomId).populate("hotelId");
        if (!room || !room.isActive || room.isInMaintenance) {
            return res.status(400).json({ message: "Room available nahi hai" });
        }

        // Overlap check karo existing bookings se
        const overlap = await Booking.findOne({
            roomId,
            status: { $in: ["Pending", "Confirmed", "CheckedIn"] },
            $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
        });

        if (overlap) {
            return res.status(409).json({ message: "Yeh dates already booked hain" });
        }

        // Nights calculate karo
        const totalNights = dayjs(checkOutDate).diff(dayjs(checkInDate), "day");
        const totalAmount = totalNights * room.price;

        // Coupon apply karo (agar diya hai)
        let discountAmount = 0;
        let finalAmount = totalAmount;
        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon && coupon.expiryDate > new Date() && totalAmount >= coupon.minBookingAmount) {
                if (coupon.discountType === "percentage") {
                    discountAmount = (totalAmount * coupon.discountValue) / 100;
                    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                } else {
                    discountAmount = coupon.discountValue;
                }
                finalAmount = Math.max(totalAmount - discountAmount, 0);

                // Usage count badhao
                coupon.usedCount += 1;
                await coupon.save();
                appliedCoupon = couponCode.toUpperCase();
            }
        }

        // Booking create karo
        const booking = await Booking.create({
            userId,
            roomId,
            hotelId: room.hotelId._id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            totalNights,
            pricePerNight: room.price,
            totalAmount,
            couponCode: appliedCoupon,
            discountAmount,
            finalAmount,
            guests,
            specialRequests: specialRequests || null,
        });

        // Temporary hold hata do
        await Temporary.deleteOne({ roomId, userId });

        const populatedBooking = await Booking.findById(booking._id)
            .populate("roomId", "roomNumber type")
            .populate("hotelId", "name address")
            .populate("userId", "name email");

        res.status(201).json({ message: "Booking ho gayi!", booking: populatedBooking });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /booking/myBookings
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate("roomId", "roomNumber type images")
            .populate("hotelId", "name address images")
            .sort({ createdAt: -1 });
        res.status(200).json({ bookings });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /booking/hotel/:hotelId
const getHotelBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ hotelId: req.params.hotelId })
            .populate("userId", "name email")
            .populate("roomId", "roomNumber type")
            .sort({ createdAt: -1 });
        res.status(200).json({ bookings });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /booking/confirm/:id
const confirmBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking nahi mili" });
        if (booking.status !== "Pending") return res.status(400).json({ message: "Sirf pending booking confirm ho sakti hai" });

        booking.status = "Confirmed";
        await booking.save();
        res.status(200).json({ message: "Booking confirm ho gayi" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /booking/checkin/:id
const checkInBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking nahi mili" });
        if (booking.status !== "Confirmed") return res.status(400).json({ message: "Sirf confirmed booking check-in ho sakti hai" });

        booking.status = "CheckedIn";
        await booking.save();
        res.status(200).json({ message: "Guest check-in ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /booking/complete/:id
const completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking nahi mili" });
        if (booking.status !== "CheckedIn") return res.status(400).json({ message: "Sirf checked-in booking complete ho sakti hai" });

        booking.status = "Completed";
        await booking.save();
        res.status(200).json({ message: "Booking complete ho gayi" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PUT /booking/cancel/:id
const cancelBooking = async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking nahi mili" });
        if (["Completed", "Cancelled"].includes(booking.status)) {
            return res.status(400).json({ message: "Yeh booking cancel nahi ho sakti" });
        }

        booking.status = "Cancelled";
        booking.cancellationReason = reason || "No reason provided";
        await booking.save();
        res.status(200).json({ message: "Booking cancel ho gayi" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /booking/bookedDates/:roomId
const getBookedDates = async (req, res) => {
    try {
        const bookings = await Booking.find({
            roomId: req.params.roomId,
            status: { $in: ["Pending", "Confirmed", "CheckedIn"] },
        }).select("checkIn checkOut");

        res.status(200).json({ bookedDates: bookings });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /booking/all (admin/superAdmin)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("userId", "name email")
            .populate("roomId", "roomNumber type")
            .populate("hotelId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ bookings });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getHotelBookings,
    confirmBooking,
    checkInBooking,
    completeBooking,
    cancelBooking,
    getBookedDates,
    getAllBookings,
};
