const express = require('express');

const {
    obtenerMaterias,
    obtenerMateriaPorId,
    crearMateria,
    actualizarMateria,
    desactivarMateria
} = require('../controllers/materiaController');

const router = express.Router();


router.get('/', obtenerMaterias);

router.get('/:id', obtenerMateriaPorId);

router.post('/', crearMateria);

router.put('/:id', actualizarMateria);

router.delete('/:id', desactivarMateria);


module.exports = router;