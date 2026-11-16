const jwt = require("jsonwebtoken");
const SignupUser = require("../Model/signupModel");

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token nahi mila" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await SignupUser.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User nahi mila" });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalid ya expire ho gaya" });
    }
};

module.exports = auth;