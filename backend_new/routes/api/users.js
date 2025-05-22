const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport');
const User = mongoose.model('User');
const { loginUser, restoreUser, requireUser } = require('../../config/passport');
const { isProduction } = require('../../config/keys');
const validateRegisterInput = require('../../validations/register');
const validateLoginInput = require('../../validations/login');

// Get current logged-in user
router.get('/current', restoreUser, (req, res) => {
  if (!req.user) return res.json(null);

  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email
  });
});

// Get a user by ID (with populated projects)
router.get('/:userid', async (req, res, next) => {
  const userId = req.params.userid;

  try {
    const user = await User.findById(userId).populate("projects");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

// Register a new user
router.post('/register', validateRegisterInput, async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      const err = new Error("Validation Error");
      err.statusCode = 400;
      err.errors = { email: "A user has already registered with this email" };
      return next(err);
    }

    const newUser = new User({
      email: req.body.email,
      username: req.body.username
    });

    const salt = await bcrypt.genSalt(10);
    newUser.hashedPassword = await bcrypt.hash(req.body.password, salt);
    const savedUser = await newUser.save();

    return res.json(await loginUser(savedUser));
  } catch (err) {
    return next(err);
  }
});

// Login a user
router.post('/login', validateLoginInput, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Invalid credentials");
      err.statusCode = 400;
      err.errors = { message: "Invalid credentials" };
      return next(err);
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      const err = new Error("Invalid credentials");
      err.statusCode = 400;
      err.errors = { message: "Invalid credentials" };
      return next(err);
    }

    return res.json(await loginUser(user));

  } catch (err) {
    return next(err);
  }
});


// Get all users (requires auth)
router.get('/', requireUser, async (req, res, next) => {
  try {
    const users = await User.find();
    const userData = users.map(user => ({
      username: user.username,
      _id: user._id
    }));

    return res.json(userData);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;