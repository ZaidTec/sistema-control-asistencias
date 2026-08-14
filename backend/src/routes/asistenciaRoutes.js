const express = require('express');

const {
    obtenerAsistencias,
    registrarAsistencia,
    actualizarAsistencia
} = require('../controllers/asistenciaController');

const router = express.Router();


router.get('/', obtenerAsistencias);

router.post('/', registrarAsistencia);

router.put('/:id', actualizarAsistencia);

module.exports = router;