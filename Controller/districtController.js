const District = require("../Model/districtModel");

const createDistrict = async (req, res) => {
    try {
        const { name, stateId } = req.body;
        const district = await District.create({ name, stateId });
        await district.populate("stateId", "name");
        res.status(201).json({ message: "District ban gaya", district });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getActiveDistricts = async (req, res) => {
    try {
        const districts = await District.find({ status: "active" })
            .populate("stateId", "name")
            .sort({ name: 1 });
        res.status(200).json({ districts });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getDistrictsByState = async (req, res) => {
    try {
        const { stateId } = req.params;
        const districts = await District.find({ stateId, status: "active" }).sort({ name: 1 });
        res.status(200).json({ districts });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, stateId } = req.body;
        const district = await District.findByIdAndUpdate(
            id,
            { name, stateId },
            { new: true }
        );
        if (!district) return res.status(404).json({ message: "District nahi mila" });
        res.status(200).json({ message: "District update ho gaya", district });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const inactiveDistrict = async (req, res) => {
    try {
        const district = await District.findByIdAndUpdate(
            req.params.id,
            { status: "inactive" },
            { new: true }
        );
        if (!district) return res.status(404).json({ message: "District nahi mila" });
        res.status(200).json({ message: "District inactive ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const restoreDistrict = async (req, res) => {
    try {
        const district = await District.findByIdAndUpdate(
            req.params.id,
            { status: "active" },
            { new: true }
        );
        if (!district) return res.status(404).json({ message: "District nahi mila" });
        res.status(200).json({ message: "District restore ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteDistrict = async (req, res) => {
    try {
        await District.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "District delete ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createDistrict,
    getActiveDistricts,
    getDistrictsByState,
    updateDistrict,
    inactiveDistrict,
    restoreDistrict,
    deleteDistrict,
};
