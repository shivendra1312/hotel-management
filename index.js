require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");

// Routes
const signupRoute = require("./Route/signupRoute");
const adminRoute = require("./Route/adminRoute");
const stateRoute = require("./Route/stateRoute");
const districtRoute = require("./Route/districtRoute");
const cityRoute = require("./Route/cityRoute");
const hotelRoute = require("./Route/hotelRoute");
const roomRoute = require("./Route/roomRoute");
const couponRoute = require("./Route/couponRoute");
const temporaryRoute = require("./Route/temporaryRoute");
const bookingRoute = require("./Route/bookingRoute");

const app = express();

// Middleware
app.use(express.json());
app.use(fileUpload()); // Image upload ke liye

// Routes mount
app.use("/userSignup", signupRoute);
app.use("/admin", adminRoute);
app.use("/state", stateRoute);
app.use("/district", districtRoute);
app.use("/city", cityRoute);
app.use("/hotel", hotelRoute);
app.use("/room", roomRoute);
app.use("/coupon", couponRoute);
app.use("/temporary", temporaryRoute);
app.use("/booking", bookingRoute);

// MongoDB connect
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch((err) => console.log("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server port ${PORT} par chal raha hai`);
});