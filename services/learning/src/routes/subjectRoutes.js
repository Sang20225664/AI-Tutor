const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// GET /api/v1/subjects
router.get('/', subjectController.getAll);

// GET /api/v1/subjects/:id
router.get('/:id', subjectController.getById);

module.exports = router;
