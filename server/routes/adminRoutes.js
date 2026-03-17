const express = require('express');
const router = express.Router();
const prisma = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "medix_secret_2026";

const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Geen toegang: Token ontbreekt" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token ongeldig" });

        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Toegang geweigerd: Geen Administrator rechten" });
        }

        req.user = user;
        next();
    });
};

router.get('/department-data', isAdmin, async (req, res) => {
    try {
        const adminDept = req.user.department;

        const admin = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        const appointments = await prisma.appointment.findMany({
            where: { department: adminDept },
            include: { user: true }
        });

        const uniqueDoctors = [...new Set(appointments.map(a => a.doctor))];
        const doctors = uniqueDoctors.map(name => ({
            name: name,
            specialization: "Specialist " + adminDept
        }));

        res.json({
            adminName: `${admin.firstName} ${admin.lastName}`, 
            department: adminDept,                            
            appointments: appointments,
            doctors: doctors,
            uniquePatients: Array.from(new Map(appointments.map(a => [a.userId, a.user])).values())
        });
    } catch (err) {
        res.status(500).json({ error: "Fout bij laden data" });
    }
});

router.post('/appointments', isAdmin, async (req, res) => {
    const { patientName, type, doctor, date, time } = req.body;
    const adminDept = req.user.department;

    try {

        const names = patientName.trim().split(/\s+/);
        const firstName = names[0];
        const lastName = names.slice(1).join(' ');

        const patient = await prisma.user.findFirst({
            where: {
                firstName: { contains: firstName, mode: 'insensitive' },
                lastName: { contains: lastName, mode: 'insensitive' },
                role: 'PATIENT'
            }
        });

        if (!patient) {
            return res.status(404).json({ error: "Patiënt niet gevonden." });
        }

        const newAppointment = await prisma.appointment.create({
            data: {
                userId: patient.id,
                doctor: doctor,
                department: adminDept,
                date: new Date(date).toISOString(),
                time: time,
                type: type,
                status: 'GEPLAND'
            }
        });

        res.status(201).json({ message: "Afspraak succesvol ingepland!", appointment: newAppointment });
    } catch (err) {
        res.status(500).json({ error: "Kon de afspraak niet opslaan." });
    }
});

router.get('/patients/search', isAdmin, async (req, res) => {
    const { query } = req.query;
    if (!query || query.length < 2) return res.json([]);

    try {
        const patients = await prisma.user.findMany({
            where: {
                role: 'PATIENT',
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { idNumber: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 5,
            select: { id: true, firstName: true, lastName: true, idNumber: true }
        });
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: "Fout bij zoeken naar patiënten" });
    }
});

router.patch('/appointments/:id/status', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updated = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Update mislukt" });
    }
});

module.exports = router;
