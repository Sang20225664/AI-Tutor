const axios = require('axios');
const jwt = require('./ai_tutor_backend/node_modules/jsonwebtoken');

const token = jwt.sign({ userId: '6993e76e884baee60f5e2668' }, 'your-super-secret-jwt-key', { expiresIn: '10h' });

async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/chat', {
            message: "Tạo quiz về môn Lập trình mạng",
            lessonId: "69ace752e214d4122d0033ea"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success:", res.data);
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}
test();
