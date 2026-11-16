const adminOrSuperAdmin = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "superAdmin")) {
        next();
    } else {
        res.status(403).json({ message: "Admin ya SuperAdmin chahiye" });
    }
};

module.exports = adminOrSuperAdmin;
