const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const superAdmin = require("../Middleware/superAdmin");
const {
    createDistrict,
    getActiveDistricts,
    getDistrictsByState,
    updateDistrict,
    inactiveDistrict,
    restoreDistrict,
    deleteDistrict,
} = require("../Controller/districtController");

router.post("/create", auth, superAdmin, createDistrict);
router.get("/active", getActiveDistricts);
router.get("/byState/:stateId", getDistrictsByState);
router.put("/update/:id", auth, superAdmin, updateDistrict);
router.patch("/inactive/:id", auth, superAdmin, inactiveDistrict);
router.patch("/restore/:id", auth, superAdmin, restoreDistrict);
router.delete("/delete/:id", auth, superAdmin, deleteDistrict);

module.exports = router;
