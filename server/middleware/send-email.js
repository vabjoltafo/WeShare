const nodemailer = require("nodemailer");

module.exports = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "admin@localhost.com",
      to: email,
      subject: subject,
      text: text
    })
    console.log("Email sent successfully");
  } catch (error) {
    console.log(error);
    console.log("Email failed");
  }
}
