const { Loan } = require('../models');
const { Op } = require('sequelize');

// Get all loans
const getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.findAll();
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get loan by ID
const getLoanById = async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.id);
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        res.json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new loan application
const applyLoan = async (req, res) => {
    try {
        const { amount, termMonths } = req.body;
        const userId = req.user.id; // Assuming user info is added by auth middleware

        // Validate loan amount
        if (amount < 1000) {
            return res.status(400).json({ message: 'Minimum loan amount is $1,000' });
        }

        // Validate term
        if (termMonths < 1 || termMonths > 60) {
            return res.status(400).json({ message: 'Loan term must be between 1 and 60 months' });
        }

        // Calculate interest rate (simple example - in real app, this would be more complex)
        const interestRate = 5.0; // 5% annual interest rate

        // Calculate monthly payment (simple calculation - in real app, use proper amortization)
        const monthlyInterestRate = interestRate / 12 / 100;
        const monthlyPayment = (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) /
            (Math.pow(1 + monthlyInterestRate, termMonths) - 1);

        const loan = await Loan.create({
            userId,
            amount,
            termMonths,
            interestRate,
            monthlyPayment,
            status: 'Pending'
        });

        res.status(201).json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update loan status
const updateLoanStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const loan = await Loan.findByPk(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        loan.status = status;
        await loan.save();

        res.json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's loans
const getUserLoans = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user info is added by auth middleware
        const loans = await Loan.findAll({
            where: { userId }
        });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllLoans,
    getLoanById,
    applyLoan,
    updateLoanStatus,
    getUserLoans
};
