const express = require('express');
const cors = require('cors');
const app = express();

const authRoutes = require('./routes/authRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');

const PORT = 5000;

app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', patientRoutes);

app.get('/api/status', (req, res) => res.json({ status: "ok", message: "MedixFlow Backend draait!" }));

app.listen(PORT, () => {
    console.log(`🚀 Server draait op http://localhost:${PORT}`);
});