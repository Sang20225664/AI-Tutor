const jwt = require('jsonwebtoken');
require('dotenv').config({path: '/home/tansang/Documents/AI-Tutor/ai_tutor_backend/.env'});
const token = jwt.sign({ id: "6993e76e884baee60f5e2668" }, process.env.JWT_SECRET, { expiresIn: "10h" });
console.log(token);
