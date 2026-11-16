const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const superAdmin = require("../Middleware/superAdmin");
const {
    createState,
    getActiveStates,
    getInactiveStates,
    updateState,
    inactiveState,
    restoreState,
    deleteState,
} = require("../Controller/stateController");

router.post("/create", auth, superAdmin, createState);
router.get("/active", getActiveStates);
router.get("/inactive", auth, superAdmin, getInactiveStates);
router.put("/update/:id", auth, superAdmin, updateState);
router.patch("/inactive/:id", auth, superAdmin, inactiveState);
router.patch("/restore/:id", auth, superAdmin, restoreState);
router.delete("/delete/:id", auth, superAdmin, deleteState);

module.exports = router;
