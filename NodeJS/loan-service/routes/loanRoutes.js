const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/auth');

// Apply for a new loan (Borrowers only)
router.post('/apply', authenticateToken, loanController.applyLoan);

// Get loan by ID (Borrower, Loan Officer, Admin)
router.get('/:id', authenticateToken, loanController.getLoanById);

// Get all loans (Admin and Loan Officer only)
router.get('/', authenticateToken, loanController.getAllLoans);

// Get user's loans (Borrower)
router.get('/user/loans', authenticateToken, loanController.getUserLoans);

// Update loan status (Loan Officer only)
router.put('/:id/status', authenticateToken, loanController.updateLoanStatus);

module.exports = router;