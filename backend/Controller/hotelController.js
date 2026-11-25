const Hotel = require("../Model/hotelModel");
const SignupUser = require("../Model/signupModel");
const compressImage = require("../Utilities/imageCompression");
const uploadImage = require("../Utilities/Cloudinary");
const sendEmail = require("../Utilities/ResendEmail");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// POST /hotel/create
const createHotel = async (req, res) => {
    try {
        const { name, description, address, cityId, districtId, stateId, amenities, hotelEmail } = req.body;
        const adminId = req.user._id;

        if (!req.files || !req.files.images) {
            return res.status(400).json({ message: "Kam se kam 1 image upload karo" });
        }

        // Multiple images handle karo
        const imagesArray = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const imageUrls = [];

        for (const img of imagesArray) {
            const compressed = await compressImage(img.data);
            const url = await uploadImage(compressed);
            imageUrls.push(url);
        }

        const trackingId = uuidv4();

        const hotel = await Hotel.create({
            name, description, address, cityId, districtId, stateId,
            adminId, images: imageUrls,
            amenities: amenities ? amenities.split(",").map(a => a.trim()) : [],
            hotelEmail: hotelEmail || null,
            trackingId,
        });

        res.status(201).json({ message: "Hotel create ho gaya, approval pending hai", hotel });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /hotel/public/all
const getAllPublicHotels = async (req, res) => {
    try {
        const { cityId, search } = req.query;
        const filter = { status: "Approved", isActive: true };

        if (cityId) filter.cityId = cityId;
        if (search) filter.name = { $regex: search, $options: "i" };

        const hotels = await Hotel.find(filter)
            .populate("cityId", "name")
            .populate("districtId", "name")
            .populate("stateId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ hotels });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /hotel/public/:id
const getPublicHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ _id: req.params.id, status: "Approved", isActive: true })
            .populate("cityId", "name")
            .populate("districtId", "name")
            .populate("stateId", "name")
            .populate("adminId", "name email");

        if (!hotel) return res.status(404).json({ message: "Hotel nahi mila" });
        res.status(200).json({ hotel });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /hotel/admin/myHotels
const getAdminHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({ adminId: req.user._id })
            .populate("cityId", "name")
            .populate("districtId", "name")
            .populate("stateId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ hotels });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /hotel/all (superAdmin)
const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find()
            .populate("cityId", "name")
            .populate("districtId", "name")
            .populate("stateId", "name")
            .populate("adminId", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({ hotels });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /hotel/approve/:id
const approveHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { hotelPassword } = req.body;

        const hotel = await Hotel.findById(id);
        if (!hotel) return res.status(404).json({ message: "Hotel nahi mila" });

        const hashedPassword = await bcrypt.hash(hotelPassword, 10);

        // Hotel login account banao signupUser mein
        const hotelEmail = hotel.hotelEmail || `hotel_${hotel._id}@aurastay.com`;

        const existingHotelUser = await SignupUser.findOne({ email: hotelEmail });
        if (!existingHotelUser) {
            await SignupUser.create({
                name: hotel.name,
                email: hotelEmail,
                password: hashedPassword,
                role: "hotel",
                isVerified: true,
            });
        }

        hotel.status = "Approved";
        hotel.hotelEmail = hotelEmail;
        hotel.hotelPassword = hashedPassword;
        await hotel.save();

        await sendEmail(
            hotel.hotelEmail,
            "AuraStay — Hotel Approved!",
            `<h2>${hotel.name} approve ho gaya!</h2>
             <p>Hotel Login Email: <b>${hotelEmail}</b></p>
             <p>Password: <b>${hotelPassword}</b></p>`
        );

        res.status(200).json({ message: "Hotel approve ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /hotel/reject/:id
const rejectHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const hotel = await Hotel.findByIdAndUpdate(
            id,
            { status: "Rejected", rejectionReason: reason },
            { new: true }
        );
        if (!hotel) return res.status(404).json({ message: "Hotel nahi mila" });
        res.status(200).json({ message: "Hotel reject ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /hotel/update/:id
const updateHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const hotel = await Hotel.findOneAndUpdate(
            { _id: id, adminId: req.user._id },
            updates,
            { new: true }
        );
        if (!hotel) return res.status(404).json({ message: "Hotel nahi mila ya access nahi" });
        res.status(200).json({ message: "Hotel update ho gaya", hotel });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PATCH /hotel/toggle/:id
const toggleHotelStatus = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: "Hotel nahi mila" });

        hotel.isActive = !hotel.isActive;
        await hotel.save();
        res.status(200).json({ message: `Hotel ${hotel.isActive ? "active" : "inactive"} ho gaya` });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /hotel/pending (superAdmin)
const getPendingHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({ status: "Pending" })
            .populate("adminId", "name email")
            .populate("cityId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ hotels });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createHotel,
    getAllPublicHotels,
    getPublicHotelById,
    getAdminHotels,
    getAllHotels,
    approveHotel,
    rejectHotel,
    updateHotel,
    toggleHotelStatus,
    getPendingHotels,
};
