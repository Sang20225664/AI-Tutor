const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

// GET /api/v1/lessons
router.get('/', lessonController.getAll);

// GET /api/v1/lessons/:id
router.get('/:id', lessonController.getById);

// GET /api/v1/suggestions
router.get('/suggestions', lessonController.getSuggestions);

module.exports = router;
