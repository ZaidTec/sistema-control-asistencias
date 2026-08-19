const express = require('express');

const {
    obtenerAsistencias,
    registrarAsistencia,
    actualizarAsistencia,
    eliminarAsistencia
} = require('../controllers/asistenciaController');

const router = express.Router();
const requireRole = require('../middleware/rolMiddleware');


router.get('/', obtenerAsistencias);

router.post('/', registrarAsistencia);

router.use(requireRole('ADMINISTRADOR'));

router.put('/:id', actualizarAsistencia);

router.delete('/:id', eliminarAsistencia);

module.exports = router;