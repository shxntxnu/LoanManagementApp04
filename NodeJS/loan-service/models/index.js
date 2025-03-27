const Loan = require('./loan');
const Payment = require('./Payment');

// Define relationships
Loan.hasMany(Payment, {
    foreignKey: 'loanId',
    as: 'payments'
});

Payment.belongsTo(Loan, {
    foreignKey: 'loanId',
    as: 'loan'
});

module.exports = {
    Loan,
    Payment
}; 