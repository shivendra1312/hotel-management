const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin", "superAdmin", "hotel"],
            default: "user",
        },
        otp: {
            type: String,
            default: null,
        },
        otpExpire: {
            type: Date,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const SignupUser = mongoose.model("signupUser", signupSchema);

module.exports = SignupUser;