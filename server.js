const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./server/config/db');

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Integration
app.use('/api/auth', require('./server/routes/authRoutes'));
app.use('/api/medicines', require('./server/routes/medicineRoutes'));
app.use('/api/prescriptions', require('./server/routes/prescriptionRoutes'));
app.use('/api/appointments', require('./server/routes/appointmentRoutes'));
app.use('/api/records', require('./server/routes/recordRoutes'));
app.use('/api/notifications', require('./server/routes/notificationRoutes'));

// Wildcard router: redirect unknown paths to landing index.html
app.get(/.*/, (req, res, next) => {
  // If requesting API, skip static redirect
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Port Configuration
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
