const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const JWT_SECRET = "medix_secret_2026";

// --- 1. REGISTREREN (Specifiek voor patiënten via het portaal) ---
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, idNumber, email, password, role } = req.body;

        // Controleer of gebruiker al bestaat
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
                role: role || 'PATIENT' // Standaard patiënt via de frontend
            }
        });

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Stuur precies terug wat jouw frontend verwacht in data.token, data.firstName, etc.
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

// --- 2. INLOGGEN (Voor zowel Patiënt als Admin) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password, role, department } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        // Check 1: Bestaat de gebruiker en klopt de geselecteerde rol?
        if (!user || user.role !== role) {
            return res.status(401).json({ error: "Onjuiste inloggegevens voor deze rol." });
        }

        // Check 2: Als het een admin is, klopt de geselecteerde afdeling?
        if (role === 'ADMIN' && user.department !== department) {
            return res.status(401).json({ error: "U heeft geen toegang tot deze afdeling." });
        }

        // Check 3: Wachtwoord controle
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Wachtwoord is onjuist." });
        }

        // Token genereren (department toevoegen voor admin autorisatie)
        const token = jwt.sign(
            { id: user.id, role: user.role, department: user.department },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // De response die jouw handleLogin() functie gebruikt
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