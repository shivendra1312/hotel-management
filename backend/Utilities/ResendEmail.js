const sendEmail = async (to, subject, html) => {
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": process.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: {
                    name: "AuraStay",
                    email: process.env.BREVO_FROM_EMAIL,
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html,
            }),
        });

        if (!response.ok) {
            console.log("Email bhejne mein error:", await response.text());
        }
    } catch (error) {
        console.log("Email error:", error.message);
    }
};

module.exports = sendEmail;
