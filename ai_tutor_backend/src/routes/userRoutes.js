const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// GET /api/users - Xem danh sách users (chỉ cho dev)
router.get('/', async (req, res) => {
    try {
        // Chỉ cho phép trong development mode
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const users = await User.find({}, { password: 0 }); // Không trả về password

        res.json({
            success: true,
            count: users.length,
            users: users
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách users'
        });
    }
});

// POST /api/users/register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username và password là bắt buộc'
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Username phải có ít nhất 3 ký tự'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password phải có ít nhất 6 ký tự'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Tên người dùng đã tồn tại'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            username,
            password: hashedPassword,
            createdAt: new Date()
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        console.log(`✅ User registered: ${user.username}`);

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            token,
            user: {
                id: user._id,
                username: user.username,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng ký'
        });
    }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username và password là bắt buộc'
            });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Tài khoản không tồn tại'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu không đúng'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        console.log(`✅ User logged in: ${user.username}`);

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id,
                username: user.username,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng nhập'
        });
    }
});

// POST /api/users/login/google (placeholder)
router.post('/login/google', async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Google login chưa được triển khai'
    });
});

module.exports = router;