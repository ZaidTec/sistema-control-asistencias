const express = require('express');

const {
    obtenerPeriodos,
    obtenerPeriodoPorId,
    crearPeriodo,
    actualizarPeriodo,
    desactivarPeriodo
} = require('../controllers/periodoController');

const router = express.Router();


router.get('/', obtenerPeriodos);

router.get('/:id', obtenerPeriodoPorId);

router.post('/', crearPeriodo);

router.put('/:id', actualizarPeriodo);

router.delete('/:id', desactivarPeriodo);


module.exports = router;