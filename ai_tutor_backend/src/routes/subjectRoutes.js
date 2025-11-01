const express = require('express');
const router = express.Router();
const Subject = require('../models/subject');

// GET all subjects
router.get('/', async (req, res) => {
    try {
        const { grade } = req.query;

        let query = {};
        if (grade) {
            query.grade = parseInt(grade);
        }

        const subjects = await Subject.find(query).sort({ name: 1 });
        res.json({
            success: true,
            data: subjects,
            count: subjects.length
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subjects',
            error: error.message
        });
    }
});

// GET subject by ID
router.get('/:id', async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subject',
            error: error.message
        });
    }
});

// POST create new subject (admin)
router.post('/', async (req, res) => {
    try {
        const subject = new Subject(req.body);
        await subject.save();

        res.status(201).json({
            success: true,
            data: subject,
            message: 'Subject created successfully'
        });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating subject',
            error: error.message
        });
    }
});

// PUT update subject (admin)
router.put('/:id', async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.json({
            success: true,
            data: subject,
            message: 'Subject updated successfully'
        });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating subject',
            error: error.message
        });
    }
});

// DELETE subject (admin)
router.delete('/:id', async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subject',
            error: error.message
        });
    }
});

module.exports = router;
