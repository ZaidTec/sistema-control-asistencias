const express = require('express');

const {
    obtenerSesiones,
    generarSesiones,
    obtenerSesionesHoy,
    obtenerSesionesPorFecha
} = require('../controllers/sesionController');

const requireRole = require('../middleware/rolMiddleware');

const router = express.Router();


router.get('/', obtenerSesiones);

router.get('/hoy', obtenerSesionesHoy);

router.get('/fecha/:fecha', obtenerSesionesPorFecha);

router.post('/generar', requireRole('ADMINISTRADOR'), generarSesiones)

module.exports = router;