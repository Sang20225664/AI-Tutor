const express = require('express');
const router = express.Router();
const auth = require('../middleware/userMiddleware');
const User = require('../models/user');

// Example of a protected route
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;