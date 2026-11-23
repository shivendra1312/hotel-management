const Booking = require("../Model/bookingModel");
const Hotel = require("../Model/hotelModel");
const Room = require("../Model/roomsModel");
const Review = require("../Model/reviewModel");
const SignupUser = require("../Model/signupModel");
const dayjs = require("dayjs");
const XLSX = require("xlsx");

// ─── HOTEL DASHBOARD ──────────────────────────────────────────
// GET /dashboard/hotel/:hotelId
const getHotelDashboard = async (req, res) => {
    try {
        const { hotelId } = req.params;

        const [totalBookings, pendingBookings, confirmedBookings, checkedInBookings, completedBookings, cancelledBookings] =
            await Promise.all([
                Booking.countDocuments({ hotelId }),
                Booking.countDocuments({ hotelId, status: "Pending" }),
                Booking.countDocuments({ hotelId, status: "Confirmed" }),
                Booking.countDocuments({ hotelId, status: "CheckedIn" }),
                Booking.countDocuments({ hotelId, status: "Completed" }),
                Booking.countDocuments({ hotelId, status: "Cancelled" }),
            ]);

        // Total revenue (sirf completed bookings)
        const revenueResult = await Booking.aggregate([
            { $match: { hotelId: require("mongoose").Types.ObjectId.createFromHexString(hotelId), status: "Completed" } },
            { $group: { _id: null, total: { $sum: "$finalAmount" } } },
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Total rooms
        const totalRooms = await Room.countDocuments({ hotelId });
        const activeRooms = await Room.countDocuments({ hotelId, isActive: true });

        // Reviews
        const hotel = await Hotel.findById(hotelId).select("averageRating totalReviews name");

        // Recent bookings (last 10)
        const recentBookings = await Booking.find({ hotelId })
            .populate("userId", "name email")
            .populate("roomId", "roomNumber type")
            .sort({ createdAt: -1 })
            .limit(10);

        // Monthly revenue (last 6 months)
        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    hotelId: require("mongoose").Types.ObjectId.createFromHexString(hotelId),
                    status: "Completed",
                    createdAt: { $gte: dayjs().subtract(6, "month").toDate() },
                },
            },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    revenue: { $sum: "$finalAmount" },
                    bookings: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        res.status(200).json({
            stats: {
                totalBookings, pendingBookings, confirmedBookings,
                checkedInBookings, completedBookings, cancelledBookings,
                totalRevenue, totalRooms, activeRooms,
                averageRating: hotel?.averageRating || 0,
                totalReviews: hotel?.totalReviews || 0,
            },
            recentBookings,
            monthlyRevenue,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────
// GET /dashboard/admin
const getAdminDashboard = async (req, res) => {
    try {
        const adminId = req.user._id;

        // Admin ke hotels
        const hotels = await Hotel.find({ adminId }).select("_id name status averageRating");
        const hotelIds = hotels.map((h) => h._id);

        const [totalBookings, totalRevenue, totalRooms] = await Promise.all([
            Booking.countDocuments({ hotelId: { $in: hotelIds } }),
            Booking.aggregate([
                { $match: { hotelId: { $in: hotelIds }, status: "Completed" } },
                { $group: { _id: null, total: { $sum: "$finalAmount" } } },
            ]),
            Room.countDocuments({ hotelId: { $in: hotelIds } }),
        ]);

        const recentBookings = await Booking.find({ hotelId: { $in: hotelIds } })
            .populate("userId", "name email")
            .populate("roomId", "roomNumber type")
            .populate("hotelId", "name")
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            stats: {
                totalHotels: hotels.length,
                approvedHotels: hotels.filter((h) => h.status === "Approved").length,
                totalBookings,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalRooms,
            },
            hotels,
            recentBookings,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── SUPER ADMIN PLATFORM ANALYTICS ──────────────────────────
// GET /dashboard/platform
const getPlatformAnalytics = async (req, res) => {
    try {
        const [totalUsers, totalAdmins, totalHotels, approvedHotels, totalRooms, totalBookings] =
            await Promise.all([
                SignupUser.countDocuments({ role: "user" }),
                SignupUser.countDocuments({ role: "admin" }),
                Hotel.countDocuments(),
                Hotel.countDocuments({ status: "Approved" }),
                Room.countDocuments(),
                Booking.countDocuments(),
            ]);

        // Platform total revenue
        const revenueResult = await Booking.aggregate([
            { $match: { status: "Completed" } },
            { $group: { _id: null, total: { $sum: "$finalAmount" } } },
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Booking status breakdown
        const bookingStats = await Booking.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        // Monthly revenue last 12 months
        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    status: "Completed",
                    createdAt: { $gte: dayjs().subtract(12, "month").toDate() },
                },
            },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    revenue: { $sum: "$finalAmount" },
                    bookings: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        // Top 5 hotels by revenue
        const topHotels = await Booking.aggregate([
            { $match: { status: "Completed" } },
            { $group: { _id: "$hotelId", revenue: { $sum: "$finalAmount" }, bookings: { $sum: 1 } } },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            { $lookup: { from: "hotels", localField: "_id", foreignField: "_id", as: "hotel" } },
            { $unwind: "$hotel" },
            { $project: { hotelName: "$hotel.name", revenue: 1, bookings: 1 } },
        ]);

        res.status(200).json({
            stats: {
                totalUsers, totalAdmins, totalHotels, approvedHotels,
                pendingHotels: totalHotels - approvedHotels,
                totalRooms, totalBookings, totalRevenue,
            },
            bookingStats,
            monthlyRevenue,
            topHotels,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── EXCEL EXPORT — HOTEL BOOKINGS ───────────────────────────
// GET /dashboard/export/bookings/:hotelId
const exportHotelBookings = async (req, res) => {
    try {
        const { hotelId } = req.params;

        const bookings = await Booking.find({ hotelId })
            .populate("userId", "name email")
            .populate("roomId", "roomNumber type")
            .sort({ createdAt: -1 });

        const data = bookings.map((b) => ({
            "Booking ID": b._id.toString(),
            "Guest Name": b.userId?.name || "",
            "Guest Email": b.userId?.email || "",
            "Room Number": b.roomId?.roomNumber || "",
            "Room Type": b.roomId?.type || "",
            "Check In": dayjs(b.checkIn).format("YYYY-MM-DD"),
            "Check Out": dayjs(b.checkOut).format("YYYY-MM-DD"),
            "Total Nights": b.totalNights,
            "Total Amount": b.totalAmount,
            "Discount": b.discountAmount,
            "Final Amount": b.finalAmount,
            "Status": b.status,
            "Coupon": b.couponCode || "None",
            "Booked On": dayjs(b.createdAt).format("YYYY-MM-DD HH:mm"),
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");

        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Disposition", "attachment; filename=bookings.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── EXCEL EXPORT — PLATFORM USERS ───────────────────────────
// GET /dashboard/export/users
const exportAllUsers = async (req, res) => {
    try {
        const users = await SignupUser.find({ role: "user" }).select("-password -otp -otpExpire");

        const data = users.map((u) => ({
            "Name": u.name,
            "Email": u.email,
            "Verified": u.isVerified ? "Yes" : "No",
            "Joined": dayjs(u.createdAt).format("YYYY-MM-DD"),
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");

        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getHotelDashboard,
    getAdminDashboard,
    getPlatformAnalytics,
    exportHotelBookings,
    exportAllUsers,
};
