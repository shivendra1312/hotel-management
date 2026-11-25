const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Sirf Admin access kar sakta hai" });
    }
};

module.exports = admin;