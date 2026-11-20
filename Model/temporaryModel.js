const mongoose = require("mongoose");

const temporarySchema = new mongoose.Schema(
    {
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "signupUser", required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        // TTL index: MongoDB automatically 10 min baad delete kar deta hai
        expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) },
    },
    { timestamps: true }
);

// TTL index → expiresAt ke baad document automatically delete hoga
temporarySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Temporary", temporarySchema);
