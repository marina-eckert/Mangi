require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { isProduction } = require('./config/keys');
const csurf = require('csurf');
const debug = require('debug');
require('./models/User');
require('./models/Notification');
require('./models/Project');
require('./config/passport');
const passport = require('passport');

const authRouter = require('./routes/api/users');
const csrfRouter = require('./routes/api/csrf');
const projectsRouter = require('./routes/api/projects');
const notificationsRouter = require('./routes/api/notifications');

const cors = require('cors');

const app = express();

// Middleware order matters:

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS setup (only once)
if (!isProduction) {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
}

app.use(passport.initialize());

// CSRF middleware setup
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? 'Lax' : false,
      httpOnly: true
    }
  })
);

// Routes
app.use('/api/csrf', csrfRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/notifications', notificationsRouter);

if (isProduction) {
  app.get('/', (req, res) => {
    res.cookie('CSRF-TOKEN', req.csrfToken());
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });

  app.use(express.static(path.resolve(__dirname, '../frontend/build')));

  app.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie('CSRF-TOKEN', req.csrfToken());
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// 404 handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.statusCode = 404;
  next(err);
});

const serverErrorLogger = debug('backend:error');

// Error handler
app.use((err, req, res, next) => {
  serverErrorLogger(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    statusCode,
    errors: err.errors
  });
});

module.exports = {
  app,
  server: require('http').createServer(app)
};