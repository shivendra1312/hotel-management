// dotenv → .env file se secrets load karta hai
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

// Routes (baad mein import karenge)
const signupRoute = require("./Route/signupRoute");
const stateRoute = require("./Route/stateRoute");
const districtRoute = require("./Route/districtRoute");
const cityRoute = require("./Route/cityRoute");

const app = express();

// Middleware → har request ka body JSON format mein parse karo
app.use(express.json());

// Routes mount karo
// Matlab: /userSignup/... wale saare requests signupRoute ko jayenge
app.use("/userSignup", signupRoute);
app.use("/state", stateRoute);
app.use("/district", districtRoute);
app.use("/city", cityRoute);

// MongoDB se connect karo
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch((err) => console.log("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server port ${PORT} par chal raha hai`);
});