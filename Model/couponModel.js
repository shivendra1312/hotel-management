const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        discountType: { type: String, enum: ["percentage", "fixed"], required: true },
        discountValue: { type: Number, required: true, min: 0 },
        minBookingAmount: { type: Number, default: 0 },
        maxDiscount: { type: Number, default: null },
        expiryDate: { type: Date, required: true },
        hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", default: null },
        isActive: { type: Boolean, default: true },
        usageLimit: { type: Number, default: null },
        usedCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
