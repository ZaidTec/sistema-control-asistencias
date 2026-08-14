const express = require('express');

const {
    obtenerSalones,
    obtenerSalonPorId
} = require('../controllers/salonController');

const router = express.Router();


router.get('/', obtenerSalones);

router.get('/:id', obtenerSalonPorId);


module.exports = router;