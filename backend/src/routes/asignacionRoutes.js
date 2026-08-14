const express = require('express');

const {
    obtenerAsignaciones,
    obtenerAsignacionPorId,
    crearAsignacion,
    actualizarAsignacion,
    desactivarAsignacion
} = require('../controllers/asignacionController');

const router = express.Router();

router.get('/', obtenerAsignaciones);

router.get('/:id', obtenerAsignacionPorId);

router.post('/', crearAsignacion);

router.put('/:id', actualizarAsignacion);

router.delete('/:id', desactivarAsignacion);

module.exports = router;