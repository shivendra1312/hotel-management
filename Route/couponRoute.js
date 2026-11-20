const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const adminOrHotel = require("../Middleware/adminOrHotel");
const { createCoupon, getAllCoupons, getCouponsByHotel, validateCoupon, toggleCoupon, deleteCoupon } = require("../Controller/couponController");

router.post("/create", auth, adminOrHotel, createCoupon);
router.get("/all", auth, adminOrHotel, getAllCoupons);
router.get("/hotel/:hotelId", getCouponsByHotel);
router.post("/validate", validateCoupon);
router.patch("/toggle/:id", auth, adminOrHotel, toggleCoupon);
router.delete("/delete/:id", auth, adminOrHotel, deleteCoupon);

module.exports = router;
