const Coupon = require("../Model/couponModel");

// POST /coupon/create
const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minBookingAmount, maxDiscount, expiryDate, hotelId, usageLimit } = req.body;

        const coupon = await Coupon.create({
            code, discountType, discountValue,
            minBookingAmount: minBookingAmount || 0,
            maxDiscount: maxDiscount || null,
            expiryDate,
            hotelId: hotelId || null,
            usageLimit: usageLimit || null,
        });

        res.status(201).json({ message: "Coupon ban gaya", coupon });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Yeh coupon code pehle se hai" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /coupon/all
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ coupons });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /coupon/hotel/:hotelId
const getCouponsByHotel = async (req, res) => {
    try {
        const coupons = await Coupon.find({ hotelId: req.params.hotelId, isActive: true });
        res.status(200).json({ coupons });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /coupon/validate
const validateCoupon = async (req, res) => {
    try {
        const { code, totalAmount } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) return res.status(404).json({ message: "Coupon nahi mila" });
        if (coupon.expiryDate < new Date()) return res.status(400).json({ message: "Coupon expire ho gaya" });
        if (totalAmount < coupon.minBookingAmount) {
            return res.status(400).json({ message: `Minimum booking amount ₹${coupon.minBookingAmount} hona chahiye` });
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: "Coupon usage limit khatam ho gayi" });
        }

        let discount = 0;
        if (coupon.discountType === "percentage") {
            discount = (totalAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
            discount = coupon.discountValue;
        }

        const finalAmount = Math.max(totalAmount - discount, 0);

        res.status(200).json({ message: "Coupon valid hai", discount, finalAmount, coupon });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /coupon/toggle/:id
const toggleCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: "Coupon nahi mila" });
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.status(200).json({ message: `Coupon ${coupon.isActive ? "active" : "inactive"} ho gaya` });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /coupon/delete/:id
const deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Coupon delete ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { createCoupon, getAllCoupons, getCouponsByHotel, validateCoupon, toggleCoupon, deleteCoupon };
