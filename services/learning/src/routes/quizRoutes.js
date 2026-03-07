const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Public: GET /api/v1/quizzes
router.get('/', quizController.getAll);

// Public: GET /api/v1/quizzes/:id
router.get('/:id', quizController.getById);

module.exports = router;
