const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");

const {
    sendSignupOtp,
    verifySignupOtp,
    login,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
} = require("../Controller/signupController");

router.post("/sendSignupOtp", sendSignupOtp);
router.post("/verifySignupOtp", verifySignupOtp);
router.post("/login", login);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.patch("/forgotPassword", forgotPassword);
router.patch("/resetPassword", auth, resetPassword);

module.exports = router;
