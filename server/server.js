const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('./db');

const app = express();
const PORT = 5000;
const JWT_SECRET = "medix_secret_2026";

app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));
app.use(express.json());

app.get('/api/status', (req, res) => {
    res.json({ status: "ok", message: "Server is online!" });
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, idNumber, email, password, role, department } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                firstName, lastName, idNumber, email,
                password: hashedPassword,
                role: role || 'PATIENT',
                department: department || null
            }
        });

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(201).json({ 
            message: "Gebruiker aangemaakt!", 
            token, 
            role: newUser.role 
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Registratie mislukt. Email of ID al in gebruik?" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.role !== role) {
            return res.status(401).json({ error: "Inloggegevens onjuist of verkeerde rol" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Wachtwoord onjuist" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, department: user.department },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ message: "Welkom!", token, role: user.role, department: user.department });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Serverfout tijdens inloggen" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 MedixFlow Server draait op http://localhost:${PORT}`);
});