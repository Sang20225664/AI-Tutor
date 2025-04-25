const express = require("express");
const { getLessons, createLesson } = require("../controllers/lessonController");
const auth = require("../middleware/userMiddleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        await getLessons(req, res);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post("/", auth, async (req, res) => {
    try {
        await createLesson(req, res);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;