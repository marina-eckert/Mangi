const { check } = require("express-validator");
const handleValidationErrors = require('./handleValidationErrors');

const validateTaskInput = [
    check('title')
        .exists({ checkFalsy: true }),
    check('assignee')
        .exists({ checkFalsy: true }),
    check('progress')
        .optional({nullable: true})
        .isInt({min: 0, max: 100})
        .withMessage('Progress must be an integer between 0 and 100 inclusive.'),
    handleValidationErrors
]