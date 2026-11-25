const adminOrHotel = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "hotel")) {
        next();
    } else {
        res.status(403).json({ message: "Admin ya Hotel access kar sakta hai" });
    }
};

module.exports = adminOrHotel;
