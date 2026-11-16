const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const superAdmin = require("../Middleware/superAdmin");
const {
    createCity,
    getActiveCities,
    getCitiesByDistrict,
    updateCity,
    inactiveCity,
    restoreCity,
    deleteCity,
} = require("../Controller/cityController");

router.post("/create", auth, superAdmin, createCity);
router.get("/active", getActiveCities);
router.get("/byDistrict/:districtId", getCitiesByDistrict);
router.put("/update/:id", auth, superAdmin, updateCity);
router.patch("/inactive/:id", auth, superAdmin, inactiveCity);
router.patch("/restore/:id", auth, superAdmin, restoreCity);
router.delete("/delete/:id", auth, superAdmin, deleteCity);

module.exports = router;
