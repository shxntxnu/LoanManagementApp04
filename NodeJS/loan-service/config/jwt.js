const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
  expiresIn: '3h'
};

module.exports = jwtConfig;