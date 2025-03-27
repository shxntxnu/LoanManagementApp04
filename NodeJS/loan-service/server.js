const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
require('dotenv').config();

// Import routes
const loanRoutes = require('./routes/loanRoutes');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initDb().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// API routes
app.use('/api/loans', loanRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Loan service is up and running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Loan service running on port ${PORT}`);
});

module.exports = app;
