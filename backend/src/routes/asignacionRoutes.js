const express = require('express');

const {
    obtenerAsignaciones,
    obtenerAsignacionPorId,
    crearAsignacion,
    crearAsignacionesMasivas,
    actualizarAsignacion,
    desactivarAsignacion
} = require('../controllers/asignacionController');

const requireRole = require('../middleware/rolMiddleware');

const router = express.Router();

router.get('/', obtenerAsignaciones);

router.get('/:id', obtenerAsignacionPorId);

router.use(requireRole('ADMINISTRADOR'));

router.post('/', crearAsignacion);

router.post('/masivas', crearAsignacionesMasivas);

router.put('/:id', actualizarAsignacion);

router.delete('/:id', desactivarAsignacion);

module.exports = router;