require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDatabase();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure all responses are UTF-8 JSON by default
app.use((req, res, next) => {
  // Set default content type to JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});



app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://blockchain-based-cyber-evidence-locker.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
); 


// Routes
app.use('`${process.env.NEXT_PUBLIC_API_URL}/api/auth', require('./routes/auth'));
app.use('`${process.env.NEXT_PUBLIC_API_URL}/api/evidence', require('./routes/evidence'));
app.use('`${process.env.NEXT_PUBLIC_API_URL}/api/admin', require('./routes/admin'));

// Health check
app.get('`${process.env.NEXT_PUBLIC_API_URL}/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cyber Evidence Locker API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blockchain-based Cyber Evidence Locker API',
    version: '1.0.0',
    endpoints: {
      auth: '`${process.env.NEXT_PUBLIC_API_URL}/api/auth',
      evidence: '`${process.env.NEXT_PUBLIC_API_URL}/api/evidence',
      admin: '`${process.env.NEXT_PUBLIC_API_URL}/api/admin',
      health: '`${process.env.NEXT_PUBLIC_API_URL}/api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({
    success: false,
    message: 'Route not found: ' + req.originalUrl
  });
});

// Error handler (must be last)
app.use((err, req, res, next) => {
  console.error('🔴 CRITICAL ERROR:', err);
  console.error('Stack:', err.stack);
  
  // Ensure JSON response
  res.setHeader('Content-Type', 'application/json');
  
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Also use the original error handler for non-Error objects
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
