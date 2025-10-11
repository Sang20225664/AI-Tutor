const express = require('express');
const { getLessons, createLesson } = require('../controllers/lessonController');
const router = express.Router();

// GET /api/lessons
router.get('/', getLessons);

// POST /api/lessons
router.post('/', createLesson);

module.exports = router;