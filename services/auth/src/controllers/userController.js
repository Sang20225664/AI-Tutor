const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function signUserToken(user) {
    return jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

// Xem danh sách users (chỉ cho dev)
const listUsers = async (req, res) => {
    try {
        if (process.env.NODE_ENV !== "development") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const users = await User.find({}, { password: 0 });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách users"
        });
    }
};

// Đăng ký người dùng
const registerUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username và password là bắt buộc"
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Username phải có ít nhất 3 ký tự"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password phải có ít nhất 6 ký tự"
            });
        }

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "Tên người dùng đã tồn tại"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            password: hashedPassword,
            ...(email ? { email } : {}),
            createdAt: new Date()
        });

        await newUser.save();

        const token = signUserToken(newUser);

        console.log(`✅ User registered: ${newUser.username}`);

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                createdAt: newUser.createdAt,
                ...(newUser.email ? { email: newUser.email } : {})
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng ký"
        });
    }
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username và password là bắt buộc"
            });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Tài khoản không tồn tại"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu không đúng"
            });
        }

        const token = signUserToken(user);

        console.log(`✅ User logged in: ${user.username}`);

        res.json({
            success: true,
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user._id,
                username: user.username,
                createdAt: user.createdAt,
                ...(user.email ? { email: user.email } : {})
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng nhập"
        });
    }
};

const loginWithGoogle = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Google login chưa được triển khai"
    });
};

module.exports = { listUsers, registerUser, loginUser, loginWithGoogle };
