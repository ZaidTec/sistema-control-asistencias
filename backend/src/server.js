const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

app.use(cors());
app.use(express.json());

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