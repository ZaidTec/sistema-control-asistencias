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

const esOrigenLocal = (origin) => {

    try {

        const { protocol, hostname } = new URL(origin);

        if (protocol !== 'http:') {
            return false;
        }

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return true;
        }

        const octetos = hostname.split('.').map(Number);

        if (octetos.length !== 4 || octetos.some(Number.isNaN)) {
            return false;
        }

        const [primero, segundo] = octetos;

        return primero === 10
            || (primero === 172 && segundo >= 16 && segundo <= 31)
            || (primero === 192 && segundo === 168);

    } catch (error) {
        return false;
    }
};

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || esOrigenLocal(origin)) {
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en http://0.0.0.0:${PORT}`);
});