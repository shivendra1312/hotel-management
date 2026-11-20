const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        businessName: { type: String, required: true, trim: true },
        businessAddress: { type: String, required: true, trim: true },
        profileImage: { type: String, default: null },
        otp: { type: String, default: null },
        otpExpire: { type: Date, default: null },
        trackingId: { type: String, default: null },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        rejectionReason: { type: String, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AdminRequest", adminSchema);
