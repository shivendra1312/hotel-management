const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
        districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District", required: true },
        stateId: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "signupUser", required: true },
        images: {
            type: [String],
            validate: {
                validator: (arr) => arr.length >= 1,
                message: "Kam se kam 1 image chahiye",
            },
        },
        amenities: [{ type: String, trim: true }],
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        rejectionReason: { type: String, default: null },
        isActive: { type: Boolean, default: true },
        // Hotel login credentials
        hotelEmail: { type: String, unique: true, sparse: true, lowercase: true },
        hotelPassword: { type: String, default: null },
        trackingId: { type: String, default: null },
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
