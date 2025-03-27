const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Loan = sequelize.define('Loan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 1000
        }
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Disbursed'),
        defaultValue: 'Pending',
        allowNull: false
    },
    interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'interest_rate'
    },
    termMonths: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'term_months',
        validate: {
            min: 1,
            max: 60
        }
    },
    monthlyPayment: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'monthly_payment'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'loans',
    timestamps: true,
    underscored: true
});

module.exports = Loan;
