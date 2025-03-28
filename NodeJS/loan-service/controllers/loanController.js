const Loan = require('../models/Loan');

// Get all loans
exports.getLoans = async (req, res) => {
    try {
        const loans = await Loan.find();
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get a single loan by ID
exports.getLoanById = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        res.status(200).json(loan);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Create a new loan
exports.createLoan = async (req, res) => {
    try {
        const loan = await Loan.create(req.body);
        res.status(201).json(loan);
    } catch (error) {
        res.status(400).json({ message: 'Error creating loan', error });
    }
};

// Update a loan
exports.updateLoan = async (req, res) => {
    try {
        const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        res.status(200).json(loan);
    } catch (error) {
        res.status(400).json({ message: 'Error updating loan', error });
    }
};

// Delete a loan
exports.deleteLoan = async (req, res) => {
    try {
        const loan = await Loan.findByIdAndDelete(req.params.id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        res.status(200).json({ message: 'Loan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
