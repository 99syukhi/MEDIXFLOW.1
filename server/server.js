const express = require('express');
const path = require('path');
const app = express();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');

const PORT = 5000;

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', patientRoutes);

app.get('/api/status', (req, res) => res.json({ status: "ok", message: "MedixFlow Backend draait!" }));

app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server draait op http://localhost:${PORT}`);
});