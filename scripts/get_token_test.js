const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/home/tansang/Documents/AI-Tutor/ai_tutor_backend/.env' });
const token = jwt.sign({ id: "6993e76e884baee60f5e2668" }, process.env.JWT_SECRET, { expiresIn: "10h" });

const axios = require('axios');
axios.get('http://localhost:5000/api/chats', {
    headers: { 'Authorization': `Bearer ${token}` }
}).then(r => console.log(JSON.stringify(r.data, null, 2)))
    .catch(e => console.error(e.response.data));
