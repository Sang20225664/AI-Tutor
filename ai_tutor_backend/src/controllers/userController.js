const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Đăng ký người dùng
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        // Tạo token ngay sau khi đăng ký thành công
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công!",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi đăng ký!", error });
    }
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu!" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không chính xác!" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({
            success: true,
            message: "Đăng nhập thành công!",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi đăng nhập!", error });
    }
};

module.exports = { registerUser, loginUser };
