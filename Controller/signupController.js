const SignupUser = require("../Model/signupModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../Utilities/ResendEmail");

const generateOTP = () => {
    return String(Math.floor(Math.random() * 900000 + 100000));
};

// POST /userSignup/sendSignupOtp
const sendSignupOtp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Sab fields bharo" });
        }

        const existingUser = await SignupUser.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(409).json({ message: "Email pehle se registered hai" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

        if (existingUser) {
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.otp = otp;
            existingUser.otpExpire = otpExpire;
            await existingUser.save();
        } else {
            await SignupUser.create({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpire,
            });
        }

        await sendEmail(
            email,
            "AuraStay — Email Verify Karo",
            `<h2>Tumhara OTP: <b>${otp}</b></h2><p>10 minute mein expire hoga.</p>`
        );

        res.status(200).json({ message: "OTP email par bheja gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /userSignup/verifySignupOtp
const verifySignupOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await SignupUser.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User nahi mila" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Galat OTP" });
        }

        if (user.otpExpire < new Date()) {
            return res.status(400).json({ message: "OTP expire ho gaya" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpire = null;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "5d" }
        );

        res.status(200).json({
            message: "Account ban gaya",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /userSignup/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email aur password dono chahiye" });
        }

        const user = await SignupUser.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User nahi mila" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Pehle email verify karo" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Galat password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "5d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /userSignup/sendOtp
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await SignupUser.findOne({ email, isVerified: true });

        if (!user) {
            return res.status(404).json({ message: "User nahi mila" });
        }

        const otp = generateOTP();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();

        await sendEmail(
            email,
            "AuraStay — Password Reset OTP",
            `<h2>Password reset OTP: <b>${otp}</b></h2><p>10 minute mein expire hoga.</p>`
        );

        res.status(200).json({ message: "OTP bheja gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /userSignup/verifyOtp
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await SignupUser.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpire < new Date()) {
            return res.status(400).json({ message: "OTP galat ya expire ho gaya" });
        }

        user.otp = null;
        user.otpExpire = null;
        await user.save();

        res.status(200).json({ message: "OTP verified" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /userSignup/forgotPassword
const forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await SignupUser.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User nahi mila" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password badal gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /userSignup/resetPassword
const resetPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await SignupUser.findById(req.user._id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Purana password galat hai" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password reset ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    sendSignupOtp,
    verifySignupOtp,
    login,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
};
