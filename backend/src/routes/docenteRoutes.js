const express = require('express');

const {
    obtenerDocentes,
    obtenerDocentePorId,
    crearDocente,
    actualizarDocente,
    desactivarDocente
} = require('../controllers/docenteController');

const requireRole = require('../middleware/rolMiddleware');

const router = express.Router();


router.get('/', obtenerDocentes);

router.get('/:id', obtenerDocentePorId);

router.use(requireRole('ADMINISTRADOR'));

router.post('/', crearDocente);

router.put('/:id', actualizarDocente);

router.delete('/:id', desactivarDocente);

module.exports = router;