const { check } = require("express-validator");
const handleValidationErrors = require('./handleValidationErrors');

const validateProjectInput = [
    check('title')
        .exists({ checkFalsy: true }),
    check('adminId')
        .exists({ checkFalsy: true }),
    check('startDate')
        .exists({ checkFalsy: true }),
    check('endDate')
        .exists({ checkFalsy: true }),
    handleValidationErrors
]

module.exports = validateProjectInput;