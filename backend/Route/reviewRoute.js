const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const { createReview, getHotelReviews, getMyReviews, deleteReview } = require("../Controller/reviewController");

router.post("/create", auth, createReview);
router.get("/hotel/:hotelId", getHotelReviews);
router.get("/my", auth, getMyReviews);
router.delete("/delete/:id", auth, deleteReview);

module.exports = router;
