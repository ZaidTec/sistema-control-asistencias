const express = require('express');

const {
    obtenerSalones,
    obtenerSalonPorId,
    crearSalon,
    actualizarSalon,
    eliminarSalon
} = require('../controllers/salonController');

const requireRole = require('../middleware/rolMiddleware');

const router = express.Router();


router.get('/', obtenerSalones);

router.get('/:id', obtenerSalonPorId);

router.use(requireRole('ADMINISTRADOR'));

router.post('/', crearSalon);

router.put('/:id', actualizarSalon);

router.delete('/:id', eliminarSalon);


module.exports = router;