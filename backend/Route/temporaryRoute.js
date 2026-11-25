const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const { holdRoom, checkHold, releaseHold } = require("../Controller/temporaryController");

router.post("/hold", auth, holdRoom);
router.get("/check/:roomId", checkHold);
router.delete("/release/:roomId", auth, releaseHold);

module.exports = router;
