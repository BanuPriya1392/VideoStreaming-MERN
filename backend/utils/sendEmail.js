const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  let transporter;

  // Use Ethereal for testing if placeholders are present
  if (process.env.EMAIL_USERNAME === "your-email@gmail.com" || !process.env.EMAIL_USERNAME) {
    console.log("Using Ethereal for testing...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  const mailOptions = {
    from: `Video Streaming <${process.env.EMAIL_FROM || "no-reply@stream.io"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.EMAIL_USERNAME === "your-email@gmail.com" || !process.env.EMAIL_USERNAME) {
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
