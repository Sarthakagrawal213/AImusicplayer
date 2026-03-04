const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true, // Allow cookies to be sent
}));
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
module.exports = app;