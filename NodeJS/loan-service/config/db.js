const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'mssql',
    database: 'LoanManagement01',
    username: '',  // Leave empty for Windows Authentication
    password: '',  // Leave empty for Windows Authentication
    host: '192.168.1.254',
    port: 1433,
    dialectOptions: {
        instanceName: 'SQLEXPRESS',
        options: {
            encrypt: false,
            enableArithAbort: true,
            trustServerCertificate: true,
            trustedConnection: true,
            integratedSecurity: true
        }
    }
});

// Test database connection and initialize models
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Sync database (create tables if they don't exist)
        await sequelize.sync();
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, initDb };