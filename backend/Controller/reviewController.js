const Review = require("../Model/reviewModel");
const Booking = require("../Model/bookingModel");
const Hotel = require("../Model/hotelModel");

// POST /review/create
const createReview = async (req, res) => {
    try {
        const { bookingId, cleanliness, service, comfort, location, value, comment } = req.body;
        const userId = req.user._id;

        // Booking exist karta hai aur completed hai?
        const booking = await Booking.findOne({ _id: bookingId, userId, status: "Completed" });
        if (!booking) {
            return res.status(400).json({ message: "Sirf completed booking par review de sakte ho" });
        }

        // Pehle se review hai?
        const existingReview = await Review.findOne({ bookingId });
        if (existingReview) {
            return res.status(409).json({ message: "Is booking par review pehle se hai" });
        }

        // Review create karo (pre-save hook overallRating calculate karega)
        const review = await Review.create({
            userId,
            hotelId: booking.hotelId,
            bookingId,
            cleanliness,
            service,
            comfort,
            location,
            value,
            comment: comment || "",
        });

        // Hotel ka average rating update karo
        const allReviews = await Review.find({ hotelId: booking.hotelId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length;

        await Hotel.findByIdAndUpdate(booking.hotelId, {
            averageRating: parseFloat(avgRating.toFixed(1)),
            totalReviews: allReviews.length,
        });

        res.status(201).json({ message: "Review de diya!", review });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /review/hotel/:hotelId
const getHotelReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ hotelId: req.params.hotelId })
            .populate("userId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /review/my
const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user._id })
            .populate("hotelId", "name images")
            .sort({ createdAt: -1 });
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /review/delete/:id
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!review) return res.status(404).json({ message: "Review nahi mili ya access nahi" });

        // Hotel rating recalculate karo
        const allReviews = await Review.find({ hotelId: review.hotelId });
        const avgRating = allReviews.length
            ? allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length
            : 0;

        await Hotel.findByIdAndUpdate(review.hotelId, {
            averageRating: parseFloat(avgRating.toFixed(1)),
            totalReviews: allReviews.length,
        });

        res.status(200).json({ message: "Review delete ho gayi" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { createReview, getHotelReviews, getMyReviews, deleteReview };
