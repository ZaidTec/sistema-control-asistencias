const express = require('express');

const {
    obtenerReporteAsistencias
} = require('../controllers/reporteController');

const router = express.Router();


router.get('/asistencias', obtenerReporteAsistencias);


module.exports = router;
