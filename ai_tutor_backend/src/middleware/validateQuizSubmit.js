const { validationError } = require('../utils/response');

/**
 * Validate quiz submission payload — Phase 2.5 Task 2
 *
 * Expected body:
 * {
 *   answers: [{ questionIndex: <int ≥ 0>, selectedAnswer: <int 0–3> }, ...],
 *   timeSpent: <number ≥ 0>   (optional)
 * }
 *
 * Rules:
 *  - answers must exist, be an array, and have at least 1 item
 *  - each questionIndex must be a non-negative integer
 *  - each selectedAnswer must be an integer between 0 and 3 (inclusive)
 *  - no duplicate questionIndex values allowed
 *  - timeSpent (if provided) must be a non-negative number
 */
const validateQuizSubmit = (req, res, next) => {
    const { answers, timeSpent } = req.body;
    const errors = [];

    // --- answers ---
    if (!answers) {
        errors.push('answers is required');
    } else if (!Array.isArray(answers)) {
        errors.push('answers must be an array');
    } else if (answers.length === 0) {
        errors.push('answers must contain at least one item');
    } else {
        const seenIndexes = new Set();

        answers.forEach((item, i) => {
            const { questionIndex, selectedAnswer } = item;

            // questionIndex must be non-negative integer
            if (
                questionIndex === undefined ||
                !Number.isInteger(questionIndex) ||
                questionIndex < 0
            ) {
                errors.push(`answers[${i}].questionIndex must be a non-negative integer`);
            } else {
                if (seenIndexes.has(questionIndex)) {
                    errors.push(`Duplicate questionIndex: ${questionIndex}`);
                }
                seenIndexes.add(questionIndex);
            }

            // selectedAnswer must be integer 0–3
            if (
                selectedAnswer === undefined ||
                !Number.isInteger(selectedAnswer) ||
                selectedAnswer < 0 ||
                selectedAnswer > 3
            ) {
                errors.push(`answers[${i}].selectedAnswer must be an integer between 0 and 3`);
            }
        });
    }

    // --- timeSpent (optional) ---
    if (timeSpent !== undefined) {
        if (typeof timeSpent !== 'number' || timeSpent < 0) {
            errors.push('timeSpent must be a non-negative number (seconds)');
        }
    }

    if (errors.length > 0) {
        return validationError(res, 'Invalid quiz submission', errors);
    }

    next();
};

module.exports = validateQuizSubmit;
