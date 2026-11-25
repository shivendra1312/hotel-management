const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "signupUser", required: true },
        hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
        cleanliness: { type: Number, required: true, min: 1, max: 5 },
        service: { type: Number, required: true, min: 1, max: 5 },
        comfort: { type: Number, required: true, min: 1, max: 5 },
        location: { type: Number, required: true, min: 1, max: 5 },
        value: { type: Number, required: true, min: 1, max: 5 },
        overallRating: { type: Number, default: 0 },
        comment: { type: String, trim: true, default: "" },
    },
    { timestamps: true }
);

// Pre-save hook → save se pehle overallRating calculate karo
reviewSchema.pre("save", function (next) {
    this.overallRating = parseFloat(
        ((this.cleanliness + this.service + this.comfort + this.location + this.value) / 5).toFixed(1)
    );
    next();
});

module.exports = mongoose.model("Review", reviewSchema);
