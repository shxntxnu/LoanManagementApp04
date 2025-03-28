const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Loan routes
router.get('/', loanController.getLoans);
router.get('/:id', loanController.getLoanById);
router.post('/', loanController.createLoan);
router.put('/:id', loanController.updateLoan);
router.delete('/:id', loanController.deleteLoan);

module.exports = router;