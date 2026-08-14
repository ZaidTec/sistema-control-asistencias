const express = require('express');

const {
    obtenerSesiones,
    generarSesiones,
    obtenerSesionesHoy,
    obtenerSesionesPorFecha
} = require('../controllers/sesionController');

const router = express.Router();


router.get('/', obtenerSesiones);

router.get('/hoy', obtenerSesionesHoy);

router.get('/fecha/:fecha', obtenerSesionesPorFecha);

router.post('/generar', generarSesiones)

module.exports = router;