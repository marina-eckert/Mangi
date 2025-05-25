require('dotenv').config(); 

module.exports = {
    secretOrKey: process.env.JWT_SECRET,
    mongoURI: process.env.MONGODB_URI,
    isProduction: process.env.NODE_ENV === 'production'
}