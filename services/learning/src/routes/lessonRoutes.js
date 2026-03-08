const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

// GET /api/v1/lessons
router.get('/', lessonController.getAll);

// GET /api/v1/lessons/suggestions — MUST be before /:id to avoid 'suggestions' being treated as ObjectId
router.get('/suggestions', lessonController.getSuggestions);

// GET /api/v1/lessons/:id
router.get('/:id', lessonController.getById);

module.exports = router;
