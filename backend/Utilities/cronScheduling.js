const cron = require("node-cron");
const Booking = require("../Model/bookingModel");
const dayjs = require("dayjs");

const startCronJobs = () => {
    // Har raat 12 baje chalega (midnight)
    // Cron format: "minute hour day month weekday"
    // "0 0 * * *" = har din 00:00 baje
    cron.schedule("0 0 * * *", async () => {
        try {
            const today = dayjs().startOf("day").toDate();

            // Wo bookings cancel karo jo:
            // 1. Status "Pending" ya "Confirmed" hain
            // 2. CheckIn date aaj se pehle ki hai (guest aaya hi nahi)
            const result = await Booking.updateMany(
                {
                    status: { $in: ["Pending", "Confirmed"] },
                    checkIn: { $lt: today },
                },
                {
                    status: "Cancelled",
                    cancellationReason: "Auto-cancelled: Guest did not check in",
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`Cron Job: ${result.modifiedCount} no-show bookings auto-cancelled`);
            }
        } catch (error) {
            console.log("Cron Job Error:", error.message);
        }
    });

    console.log("Cron job started ✅ (runs daily at midnight)");
};

module.exports = startCronJobs;
