const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USERNAME;
  const emailPass = process.env.EMAIL_PASSWORD
    ? process.env.EMAIL_PASSWORD.replace(/\s/g, "") // Strip spaces from App Password
    : undefined;

  console.log(`\n📤 Attempting to send email to: ${options.email}`);
  console.log(`📧 Using sender: ${emailUser || "NOT SET"}`);

  if (!emailUser || emailUser === "your-email@gmail.com" || !emailPass) {
    // Fallback to Ethereal for testing
    console.log("⚠️  EMAIL_USERNAME not configured — using Ethereal test account");
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `Nexus <${testAccount.user}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    });

    console.log("✅ Ethereal email sent:", info.messageId);
    console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
    return;
  }

  // Real Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify connection before sending
  await transporter.verify().catch((err) => {
    console.error("❌ SMTP connection failed:", err.message);
    throw new Error(`SMTP Auth Failed: ${err.message}`);
  });

  const info = await transporter.sendMail({
    from: `Nexus <${process.env.EMAIL_FROM || emailUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0A0E1A; color: white; padding: 32px; border-radius: 16px; border: 1px solid #00F0FF33;">
        <h2 style="color: #00F0FF; margin-bottom: 8px;">🔐 Nexus Security Reset</h2>
        <p style="color: #aaa; font-size: 13px;">A password reset was requested for your account.</p>
        <div style="background: #0D1223; border: 1px solid #00F0FF44; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: #aaa; font-size: 12px; margin-bottom: 8px;">YOUR ONE-TIME CODE</p>
          <h1 style="color: #00F0FF; font-size: 48px; letter-spacing: 12px; margin: 0;">${options.otp || options.message.match(/\d{6}/)?.[0] || ""}</h1>
          <p style="color: #666; font-size: 11px; margin-top: 12px;">⏳ Valid for 10 minutes</p>
        </div>
        <p style="color: #555; font-size: 11px; text-align: center;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });

  console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
};

module.exports = sendEmail;
