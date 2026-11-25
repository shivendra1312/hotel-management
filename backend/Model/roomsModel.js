const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
        roomNumber: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ["Single", "Double", "Suite", "Deluxe", "Family"],
            required: true,
        },
        price: { type: Number, required: true, min: 0 },
        maxGuests: { type: Number, required: true, min: 1 },
        description: { type: String, trim: true },
        amenities: [{ type: String, trim: true }],
        images: [{ type: String }],
        isActive: { type: Boolean, default: true },
        isInMaintenance: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Compound index: ek hotel mein same room number nahi ho sakta
roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);
