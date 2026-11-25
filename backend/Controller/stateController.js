const State = require("../Model/stateModel");

const createState = async (req, res) => {
    try {
        const { name } = req.body;
        const state = await State.create({ name });
        res.status(201).json({ message: "State ban gaya", state });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Yeh state pehle se hai" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getActiveStates = async (req, res) => {
    try {
        const states = await State.find({ status: "active" }).sort({ name: 1 });
        res.status(200).json({ states });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getInactiveStates = async (req, res) => {
    try {
        const states = await State.find({ status: "inactive" }).sort({ name: 1 });
        res.status(200).json({ states });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const state = await State.findByIdAndUpdate(id, { name }, { new: true });
        if (!state) return res.status(404).json({ message: "State nahi mila" });
        res.status(200).json({ message: "State update ho gaya", state });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const inactiveState = async (req, res) => {
    try {
        const state = await State.findByIdAndUpdate(
            req.params.id,
            { status: "inactive" },
            { new: true }
        );
        if (!state) return res.status(404).json({ message: "State nahi mila" });
        res.status(200).json({ message: "State inactive ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const restoreState = async (req, res) => {
    try {
        const state = await State.findByIdAndUpdate(
            req.params.id,
            { status: "active" },
            { new: true }
        );
        if (!state) return res.status(404).json({ message: "State nahi mila" });
        res.status(200).json({ message: "State restore ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteState = async (req, res) => {
    try {
        await State.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "State delete ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createState,
    getActiveStates,
    getInactiveStates,
    updateState,
    inactiveState,
    restoreState,
    deleteState,
};
