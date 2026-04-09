const express = require('express');
const path = require('path');
const cors = require('cors'); // Added for frontend/backend communication
const { PrismaClient } = require('@prisma/client'); // Import Prisma

const app = express();
const prisma = new PrismaClient(); // Initialize Prisma

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');

const PORT = 5000;

// Middleware
app.use(cors()); // Prevents CORS errors when your frontend calls the API
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', patientRoutes);

// Health check
app.get('/api/status', (req, res) => {
    res.json({ status: "ok", message: "MedixFlow Backend draait!" });
});

// Static files (Frontend)
app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server draait op http://localhost:${PORT}`);
});