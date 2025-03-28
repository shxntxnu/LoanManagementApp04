const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  loanId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  loanAmount: { type: Number, required: true },
  loanType: { type: String, required: true },
  interestRate: { type: Number, required: true },
  loanTerm: { type: Number, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loan', loanSchema);