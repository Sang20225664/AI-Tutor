const express = require('express');
const {
    listUsers,
    registerUser,
    loginUser,
    loginWithGoogle
} = require('../controllers/userController');

const router = express.Router();

// GET /api/auth - Xem danh sách users (chỉ cho dev)
router.get('/', listUsers);

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/login/google (placeholder)
router.post('/login/google', loginWithGoogle);

module.exports = router;
