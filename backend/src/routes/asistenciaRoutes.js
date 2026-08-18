const express = require('express');

const {
    obtenerAsistencias,
    registrarAsistencia,
    actualizarAsistencia,
    eliminarAsistencia
} = require('../controllers/asistenciaController');

const router = express.Router();


router.get('/', obtenerAsistencias);

router.post('/', registrarAsistencia);

router.put('/:id', actualizarAsistencia);

router.delete('/:id', eliminarAsistencia);

module.exports = router;