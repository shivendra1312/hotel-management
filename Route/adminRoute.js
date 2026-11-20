const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const superAdmin = require("../Middleware/superAdmin");
const {
    sendAdminSignupOtp,
    verifyAndCreateAdmin,
    getPendingAdmins,
    getAllAdmins,
    approveAdmin,
    rejectAdmin,
    trackAdminRequest,
} = require("../Controller/adminController");

router.post("/sendAdminSignupOtp", sendAdminSignupOtp);
router.post("/verifyAndCreateAdmin", verifyAndCreateAdmin);
router.get("/pending", auth, superAdmin, getPendingAdmins);
router.get("/all", auth, superAdmin, getAllAdmins);
router.patch("/approve/:id", auth, superAdmin, approveAdmin);
router.patch("/reject/:id", auth, superAdmin, rejectAdmin);
router.get("/track/:trackingId", trackAdminRequest);

module.exports = router;
