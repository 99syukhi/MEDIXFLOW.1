const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const JWT_SECRET = "medix_secret_2026";

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, idNumber, email, password, role } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { idNumber }] }
        });

        if (existingUser) {
            return res.status(400).json({ error: "Email of ID-nummer is al in gebruik." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                idNumber,
                email,
                password: hashedPassword,
                role: role || 'PATIENT' 
            }
        });

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(201).json({ 
            message: "Registratie succesvol!", 
            token, 
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName 
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: "Er is iets misgegaan bij het aanmaken van je account." });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, role, department } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.role !== role) {
            return res.status(401).json({ error: "Onjuiste inloggegevens voor deze rol." });
        }

        if (role === 'ADMIN' && user.department !== department) {
            return res.status(401).json({ error: "U heeft geen toegang tot deze afdeling." });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Wachtwoord is onjuist." });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, department: user.department },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            role: user.role, 
            firstName: user.firstName,
            lastName: user.lastName,
            department: user.department 
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Serverfout tijdens inloggen." });
    }
});

module.exports = router;