require('dotenv').config();

const { generateAccessToken } = require('../src/utils/jwt');

const userId = process.argv[2] || '66c1234567890abcdef12345';
const token = generateAccessToken({
  _id: userId,
  tokenVersion: 0,
  role: 'user',
});

console.log(token);
