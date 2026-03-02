const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const clgDev = require('./utils/clgDev');
const errorHandler = require('./middlewares/errorHandler');


const path = require('path');
const cloudinaryConnect = require('./config/cloudinaryConnect');

dotenv.config({ path: './config/process.env' });
const PORT = process.env.PORT || 4000;
const app = express();
connectDB();
cloudinaryConnect();

// Security HTTP headers
app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);
app.use(cookieParser());

// CORS - restrict to allowed frontend origin(s)
// STUDY_NOTION_FRONTEND_SITE may be a comma-separated list of origins
const allowedOrigins = (process.env.STUDY_NOTION_FRONTEND_SITE || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0 && process.env.NODE_ENV === 'production') {
  console.error('FATAL: STUDY_NOTION_FRONTEND_SITE is not set. CORS will block all cross-origin requests.'.red.bold);
  process.exit(1);
}

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : false,
  credentials: true,
}));

// Rate limiting for auth routes (100 requests per 10 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
const AuthR = require('./routes/AuthR');
const CategoryR = require('./routes/CategoryR');
const CourseProgressR = require('./routes/CourseProgressR');
const CourseR = require('./routes/CourseR');
const PaymentR = require('./routes/PaymentR');
const ProfileR = require('./routes/ProfileR');
const ReviewR = require('./routes/ReviewR');
const SectionR = require('./routes/SectionR');
const SubSectionR = require('./routes/SubSectionR');
const UserR = require('./routes/UserR');
const OtherR = require('./routes/OtherR');

app.use('/api/v1/auth', authLimiter, AuthR);
app.use('/api/v1/categories', CategoryR);
app.use('/api/v1/courses', CourseR);
app.use('/api/v1/payments', PaymentR);
app.use('/api/v1/profiles', ProfileR);
app.use('/api/v1/reviews', ReviewR);
app.use('/api/v1/sections', SectionR);
app.use('/api/v1/subsections', SubSectionR);
app.use('/api/v1/users', UserR);
app.use('/api/v1/other', OtherR);
app.use('/api/v1/courseprogress', CourseProgressR);

app.use(errorHandler); // must be after mounting the routes

app.get('/', (req, res) => {
  res.send('Hello jiiii');
});

app.listen(PORT, (err) => {
  if (err) {
    clgDev('Error occurred creating server');
    process.exit();
  }
  clgDev(`Server in running on ${PORT}`.yellow.underline.bold);
});

// TODO : check for these, what it is
/**
 * // handle unhandled promise rejection
 * process.on("unhandledRejection", (err, promise) => {
 *  clgDev(`Error : ${err.message}`.red);
 *  // close server & exit process
 *  server.close(()=>process.exit(1));
 * });
 */
module.exports = app;