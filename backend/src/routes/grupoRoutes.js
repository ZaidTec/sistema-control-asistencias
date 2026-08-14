const express = require('express');

const {
    obtenerGrupos,
    obtenerGrupoPorId,
    crearGrupo,
    actualizarGrupo,
    desactivarGrupo
} = require('../controllers/grupoController');

const router = express.Router();


router.get('/', obtenerGrupos);

router.get('/:id', obtenerGrupoPorId);

router.post('/', crearGrupo);

router.put('/:id', actualizarGrupo);

router.delete('/:id', desactivarGrupo);


module.exports = router;