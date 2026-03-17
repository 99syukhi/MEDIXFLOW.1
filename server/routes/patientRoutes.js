const express = require('express');
const router = express.Router();
const prisma = require('../db'); 
const jwt = require('jsonwebtoken');

const JWT_SECRET = "medix_secret_2026";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Geen toegang: Token ontbreekt" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token is niet meer geldig" });
        }
        req.user = user; 
        next();
    });
};

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                idNumber: true,
                insuranceCompany: true,
                insuranceType: true,
                insuranceNumber: true,
                insuranceExpiry: true
            }
        });
        if (!user) return res.status(404).json({ error: "Gebruiker niet gevonden" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Kon profielgegevens niet ophalen" });
    }
});

router.put('/update-profile', authenticateToken, async (req, res) => {
    const { insuranceCompany, insuranceType, insuranceNumber, insuranceExpiry } = req.body;

    try {
        let formattedDate = null;
        if (insuranceExpiry && insuranceExpiry.trim() !== "") {
            formattedDate = new Date(insuranceExpiry).toISOString();
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                insuranceCompany: insuranceCompany || null,
                insuranceType: insuranceType || null,
                insuranceNumber: insuranceNumber || null,
                insuranceExpiry: formattedDate
            }
        });

        res.json({ message: "Succes", user: updatedUser });
    } catch (err) {
        console.error("Prisma Error Details:", err); // Dit laat de echte fout zien in je terminal
        res.status(500).json({ error: "Database error: controleer of de velden bestaan." });
    }
});

router.get('/appointments/check-availability', authenticateToken, async (req, res) => {
    const { doctor, date } = req.query; 
    if (!doctor || !date) return res.status(400).json({ error: "Incomplete parameters" });

    try {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const busySlots = await prisma.appointment.findMany({
            where: {
                doctor: doctor,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    in: ['GEPLAND', 'VOLTOOID'] 
                }
            },
            select: { time: true }
        });

        res.json(busySlots.map(slot => slot.time));
    } catch (err) {
        console.error("Fout bij laden beschikbaarheid:", err);
        res.status(500).json({ error: "Serverfout bij ophalen tijden" });
    }
});

router.post('/create-appointment', authenticateToken, async (req, res) => {
    const { doctor, date, time, department } = req.body;

    try {
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                doctor: doctor,
                date: new Date(date).toISOString(),
                time: time,
                status: 'GEPLAND'
            }
        });

        if (existingAppointment) {
            return res.status(409).json({ 
                error: "Deze dokter heeft op dit tijdstip al een andere patiënt." 
            });
        }

        const newAppt = await prisma.appointment.create({
            data: {
                userId: req.user.id,
                doctor,
                department,
                date: new Date(date).toISOString(),
                time,
                status: 'GEPLAND',
                type: 'Consult'
            }
        });
        res.status(201).json(newAppt);
    } catch (err) {
        res.status(500).json({ error: "Serverfout bij het inplannen." });
    }
});

router.patch('/appointments/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.id);

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        });

        if (!appointment || appointment.userId !== req.user.id) {
            return res.status(403).json({ error: "Niet gemachtigd om deze afspraak te annuleren" });
        }

        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'GECANCELLED' }
        });

        res.json({ message: "Geannuleerd", appointment: updated });
    } catch (err) {
        console.error("Fout bij annuleren:", err);
        res.status(500).json({ error: "Interne serverfout" });
    }
});

router.get('/appointments', authenticateToken, async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                userId: req.user.id 
            },
            orderBy: {
                date: 'asc'
            }
        });
        res.json(appointments);
    } catch (err) {
        console.error("Fout bij ophalen afspraken:", err);
        res.status(500).json({ error: "Kon afspraken niet ophalen" });
    }
});

module.exports = router;