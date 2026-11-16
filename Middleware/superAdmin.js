const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === "superAdmin") {
        next();
    } else {
        res.status(403).json({ message: "Sirf SuperAdmin access kar sakta hai" });
    }
};

module.exports = superAdmin;