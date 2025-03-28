const Loan = require('./Loan');
const Payment = require('./payment');

// Relationships in Mongoose are defined using references in schemas.
// The `loanId` field in the Payment schema already references the Loan model.

module.exports = {
    Loan,
    Payment
};