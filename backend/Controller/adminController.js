const AdminRequest = require("../Model/adminModel");
const SignupUser = require("../Model/signupModel");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../Utilities/ResendEmail");
const compressImage = require("../Utilities/imageCompression");
const uploadImage = require("../Utilities/Cloudinary");

const generateOTP = () => String(Math.floor(Math.random() * 900000 + 100000));

// POST /admin/sendAdminSignupOtp
const sendAdminSignupOtp = async (req, res) => {
    try {
        const { name, email, phone, businessName, businessAddress } = req.body;

        if (!name || !email || !phone || !businessName || !businessAddress) {
            return res.status(400).json({ message: "Sab fields bharo" });
        }

        const existing = await AdminRequest.findOne({ email });
        if (existing && existing.status === "Approved") {
            return res.status(409).json({ message: "Yeh email pehle se approved hai" });
        }

        const otp = generateOTP();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

        if (existing) {
            existing.name = name;
            existing.phone = phone;
            existing.businessName = businessName;
            existing.businessAddress = businessAddress;
            existing.otp = otp;
            existing.otpExpire = otpExpire;
            existing.status = "Pending";
            await existing.save();
        } else {
            await AdminRequest.create({
                name, email, phone, businessName, businessAddress, otp, otpExpire,
            });
        }

        await sendEmail(
            email,
            "AuraStay — Admin Registration OTP",
            `<h2>Tumhara OTP: <b>${otp}</b></h2><p>10 minute mein expire hoga.</p>`
        );

        res.status(200).json({ message: "OTP bheja gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /admin/verifyAndCreateAdmin
const verifyAndCreateAdmin = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const admin = await AdminRequest.findOne({ email });

        if (!admin) return res.status(404).json({ message: "Request nahi mili" });
        if (admin.otp !== otp) return res.status(400).json({ message: "Galat OTP" });
        if (admin.otpExpire < new Date()) return res.status(400).json({ message: "OTP expire ho gaya" });

        // Profile image upload
        if (req.files && req.files.profileImage) {
            const compressed = await compressImage(req.files.profileImage.data);
            const url = await uploadImage(compressed);
            admin.profileImage = url;
        }

        const trackingId = uuidv4();
        admin.otp = null;
        admin.otpExpire = null;
        admin.trackingId = trackingId;
        await admin.save();

        await sendEmail(
            email,
            "AuraStay — Admin Request Received",
            `<h2>Tumhari request receive ho gayi!</h2>
             <p>Tracking ID: <b>${trackingId}</b></p>
             <p>Super Admin review karega aur approve/reject karega.</p>`
        );

        res.status(200).json({ message: "Request submit ho gayi", trackingId });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /admin/pending
const getPendingAdmins = async (req, res) => {
    try {
        const admins = await AdminRequest.find({ status: "Pending" }).sort({ createdAt: -1 });
        res.status(200).json({ admins });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /admin/all
const getAllAdmins = async (req, res) => {
    try {
        const admins = await AdminRequest.find().sort({ createdAt: -1 });
        res.status(200).json({ admins });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /admin/approve/:id
const approveAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        const admin = await AdminRequest.findById(id);
        if (!admin) return res.status(404).json({ message: "Request nahi mili" });
        if (admin.status !== "Pending") return res.status(400).json({ message: "Already processed hai" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await SignupUser.create({
            name: admin.name,
            email: admin.email,
            password: hashedPassword,
            role: "admin",
            isVerified: true,
        });

        admin.status = "Approved";
        await admin.save();

        await sendEmail(
            admin.email,
            "AuraStay — Admin Request Approved!",
            `<h2>Congratulations! Tumhara admin account approve ho gaya.</h2>
             <p>Email: <b>${admin.email}</b></p>
             <p>Password: <b>${password}</b></p>
             <p>Login karke password change karo.</p>`
        );

        res.status(200).json({ message: "Admin approve ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /admin/reject/:id
const rejectAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const admin = await AdminRequest.findById(id);
        if (!admin) return res.status(404).json({ message: "Request nahi mili" });

        admin.status = "Rejected";
        admin.rejectionReason = reason || "No reason provided";
        await admin.save();

        await sendEmail(
            admin.email,
            "AuraStay — Admin Request Rejected",
            `<h2>Tumhari admin request reject ho gayi.</h2>
             <p>Reason: <b>${admin.rejectionReason}</b></p>`
        );

        res.status(200).json({ message: "Admin reject ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /admin/track/:trackingId
const trackAdminRequest = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const admin = await AdminRequest.findOne({ trackingId }).select("-otp -otpExpire");
        if (!admin) return res.status(404).json({ message: "Tracking ID se koi request nahi mili" });
        res.status(200).json({ admin });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    sendAdminSignupOtp,
    verifyAndCreateAdmin,
    getPendingAdmins,
    getAllAdmins,
    approveAdmin,
    rejectAdmin,
    trackAdminRequest,
};
