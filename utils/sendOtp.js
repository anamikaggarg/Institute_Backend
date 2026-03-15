const axios = require("axios");

const sendOtp = async (email, otp) => {
  try {

    await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,   
      accessToken: process.env.EMAILJS_PRIVATE_KEY,

      template_params: {
        to_email: email,
        otp: otp
      }
    });

    console.log("OTP email sent to:", email);

    console.log("SERVICE:", process.env.EMAILJS_SERVICE_ID);
    console.log("TEMPLATE:", process.env.EMAILJS_TEMPLATE_ID);
    console.log("PUBLIC:", process.env.EMAILJS_PUBLIC_KEY);
    console.log("PRIVATE:", process.env.EMAILJS_PRIVATE_KEY);

  } catch (error) {
    console.log("EmailJS Error:", error.response?.data || error.message);
  }
};

module.exports = sendOtp;