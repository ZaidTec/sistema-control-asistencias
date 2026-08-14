const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const docenteRoutes = require('./routes/docenteRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const grupoRoutes = require('./routes/grupoRoutes');
const salonRoutes = require('./routes/salonRoutes');
const periodoRoutes = require('./routes/periodoRoutes');
const asignacionRoutes = require('./routes/asignacionRoutes');
const sesionRoutes = require('./routes/sesionRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/docentes', docenteRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/salones', salonRoutes);
app.use('/api/periodos', periodoRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/sesiones', sesionRoutes);
app.use('/api/asistencias', asistenciaRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API del sistema de control de asistencias funcionando'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});