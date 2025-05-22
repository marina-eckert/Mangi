// routes/api/csrf.js

const express = require('express');
const router = express.Router();

const { isProduction } = require('../../config/keys');

router.get('/restore', (req, res) => {
  const csrfToken = req.csrfToken();

  // Set token as a cookie (for frontend to read via JS)
  res.cookie('CSRF-TOKEN', csrfToken);

  res.status(200).json({
    message: 'CSRF token set'
  });
});

module.exports = router;