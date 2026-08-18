const express = require('express');

const {
    obtenerMaterias,
    obtenerMateriaPorId,
    crearMateria,
    actualizarMateria,
    desactivarMateria
} = require('../controllers/materiaController');

const requireRole = require('../middleware/rolMiddleware');

const router = express.Router();


router.get('/', obtenerMaterias);

router.get('/:id', obtenerMateriaPorId);

router.use(requireRole('ADMINISTRADOR'));

router.post('/', crearMateria);

router.put('/:id', actualizarMateria);

router.delete('/:id', desactivarMateria);


module.exports = router;