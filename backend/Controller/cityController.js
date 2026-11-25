const City = require("../Model/cityModel");

const createCity = async (req, res) => {
    try {
        const { name, districtId, stateId } = req.body;
        const city = await City.create({ name, districtId, stateId });
        await city.populate(["districtId", "stateId"]);
        res.status(201).json({ message: "City ban gayi", city });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getActiveCities = async (req, res) => {
    try {
        const cities = await City.find({ status: "active" })
            .populate("districtId", "name")
            .populate("stateId", "name")
            .sort({ name: 1 });
        res.status(200).json({ cities });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getCitiesByDistrict = async (req, res) => {
    try {
        const { districtId } = req.params;
        const cities = await City.find({ districtId, status: "active" }).sort({ name: 1 });
        res.status(200).json({ cities });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, districtId, stateId } = req.body;
        const city = await City.findByIdAndUpdate(
            id,
            { name, districtId, stateId },
            { new: true }
        );
        if (!city) return res.status(404).json({ message: "City nahi mili" });
        res.status(200).json({ message: "City update ho gayi", city });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const inactiveCity = async (req, res) => {
    try {
        await City.findByIdAndUpdate(req.params.id, { status: "inactive" });
        res.status(200).json({ message: "City inactive ho gayi" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const restoreCity = async (req, res) => {
    try {
        await City.findByIdAndUpdate(req.params.id, { status: "active" });
        res.status(200).json({ message: "City restore ho gayi" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteCity = async (req, res) => {
    try {
        await City.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "City delete ho gayi" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createCity,
    getActiveCities,
    getCitiesByDistrict,
    updateCity,
    inactiveCity,
    restoreCity,
    deleteCity,
};
