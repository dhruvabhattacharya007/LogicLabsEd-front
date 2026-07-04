const nodemailer = require('nodemailer');

const createMailTransport = () =>
  nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

// Checks the SMTP connection/credentials without sending any mail.
// Used by the periodic health check so we find out the moment the
// Gmail app password is revoked/expired, instead of when a user's
// contact form silently fails.
const verifyMailTransport = async () => {
  const transporter = createMailTransport();
  await transporter.verify();
};

const emailSender = async (toEmail, subject, body, replyTo) => {
  try {
    // For real purpose
    const transporter = createMailTransport();

    // // For testing / development purpose
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   auth: {
    //     user: process.env.SMTP_EMAIL,
    //     pass: process.env.SMTP_PASSWORD,
    //   },
    // });

    // send mail
    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME} | Logic Labs Ed <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: subject,
      html: body,
      ...(replyTo ? { replyTo } : {}),
    });

    return info;
  } catch (err) {
    console.error(`emailSender failed to send to ${toEmail}: ${err.message}`);
    throw err;
  }
};

module.exports = emailSender;
module.exports.verifyMailTransport = verifyMailTransport;
