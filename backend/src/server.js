const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe existir y tener al menos 32 caracteres');
}

const app = express();

const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const docenteRoutes = require('./routes/docenteRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const grupoRoutes = require('./routes/grupoRoutes');
const salonRoutes = require('./routes/salonRoutes');
const periodoRoutes = require('./routes/periodoRoutes');
const asignacionRoutes = require('./routes/asignacionRoutes');
const sesionRoutes = require('./routes/sesionRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origen no permitido por CORS'));
    }
}));
app.use(express.json({ limit: '100kb' }));

app.use('/api/auth', authRoutes);

app.use('/api/docentes', authMiddleware, docenteRoutes);
app.use('/api/materias', authMiddleware, materiaRoutes);
app.use('/api/grupos', authMiddleware, grupoRoutes);
app.use('/api/salones', authMiddleware, salonRoutes);
app.use('/api/periodos', authMiddleware, periodoRoutes);
app.use('/api/asignaciones', authMiddleware, asignacionRoutes);
app.use('/api/sesiones', authMiddleware, sesionRoutes);
app.use('/api/asistencias', authMiddleware, asistenciaRoutes);
app.use('/api/usuarios', authMiddleware, usuarioRoutes);
app.use('/api/reportes', authMiddleware, reporteRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API del sistema de control de asistencias funcionando'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});