const ErrorResponse = require('../utils/ErrorResponse');
const emailSender = require('../utils/emailSender');

const dotenv = require("dotenv");
dotenv.config();

const { contactUsEmail } = require('../mail/templates/contactFormRes');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{7,12}$/;

// @desc      Contact us
// @route     POST /api/v1/other/contactus
// @access    Public
exports.contactUs = async (req, res, next) => {
  try {
    const { firstName, lastName, email, countryCode, phoneNo, message } = req.body;

    if (!(firstName && lastName && email && countryCode && phoneNo && message)) {
      return next(new ErrorResponse('Some fields are missing', 400));
    }

    if (!EMAIL_REGEX.test(email)) {
      return next(new ErrorResponse('Please enter a valid email address', 400));
    }

    if (!PHONE_REGEX.test(phoneNo)) {
      return next(new ErrorResponse('Please enter a valid phone number', 400));
    }

    try {
      await emailSender(
        process.env.SITE_OWNER_EMAIL,
        `Contact Me - ${message.substring(0, 10)} ...`,
        `
      <h1>Someone requested to contact you</h1>
      <h2>Contact Details</h2>
      <h1></h1>
      <p> Name : ${firstName} ${lastName}</p>
      <p> Email : ${email}</p>
      <p> Phone No : ${countryCode} ${phoneNo}</p>
      <p> Message : ${message}</p>
      <h1></h1>
      <h2>Kindly contact them, and solve their problem as soon as possible.</h2>
      <h1>Thank You !</h1>
      `,
        email
      );
    } catch (err) {
      console.error(`Contact form: failed to notify site owner - ${err.message}`);
      return next(new ErrorResponse('Could not send your message right now. Please try again in a bit.', 502));
    }

    // Best-effort confirmation email to the sender - the owner has already been
    // notified above, so a failure here shouldn't fail the whole request.
    try {
      await emailSender(
        email,
        'Your Data sent to us successfully',
        contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)
      );
    } catch (err) {
      console.error(`Contact form: failed to send confirmation email to sender - ${err.message}`);
    }

    return res.json({
      success: true,
      data: 'Details sent successfully',
    });
  } catch (err) {
    next(new ErrorResponse('Details send failed', 500));
  }
};