const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "signupUser", required: true },
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
        hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        totalNights: { type: Number, required: true },
        pricePerNight: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        couponCode: { type: String, default: null },
        discountAmount: { type: Number, default: 0 },
        finalAmount: { type: Number, required: true },
        guests: { type: Number, required: true, min: 1 },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "CheckedIn", "Completed", "Cancelled"],
            default: "Pending",
        },
        cancellationReason: { type: String, default: null },
        specialRequests: { type: String, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
