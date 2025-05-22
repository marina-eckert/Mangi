const { check } = require("express-validator");
const handleValidationErrors = require('./handleValidationErrors');

const validateLoginInput = [
  check('username')  // change from 'email' to 'username'
    .exists({ checkFalsy: true })
    .withMessage('Username is required'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6, max: 30 })
    .withMessage('Password must be between 6 and 30 characters'),
  handleValidationErrors
];

module.exports = validateLoginInput;