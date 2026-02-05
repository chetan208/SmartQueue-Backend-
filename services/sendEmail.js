import axios from "axios";

const sendOTPEmail = async (toEmail, otp) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "SmartQueue",
          email: "smartqueue108@gmail.com", // must be verified
        },
        to: [
          {
            email: toEmail,
          },
        ],
        subject: "Your OTP for Email Verification",
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2>Email Verification</h2>
              <p>Your OTP is:</p>
              <h1 style="letter-spacing: 2px;">${otp}</h1>
              <p>This OTP is valid for <b>5 minutes</b>.</p>
              <p>If you did not request this, please ignore.</p>
            </body>
          </html>
        `,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    console.log("✅ OTP email sent:", response.data.messageId);
    return true;
  } catch (error) {
    console.log(
      "❌ OTP Email Error:",
      error.response?.data || error.message
    );
    return false;
  }
};

export default sendOTPEmail;
