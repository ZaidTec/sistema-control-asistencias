const express = require('express');

const {
    obtenerGrupos,
    obtenerGrupoPorId,
    crearGrupo,
    actualizarGrupo,
    desactivarGrupo
} = require('../controllers/grupoController');

const requireRole = require('../middleware/rolMiddleware');

const router = express.Router();


router.get('/', obtenerGrupos);

router.get('/:id', obtenerGrupoPorId);

router.use(requireRole('ADMINISTRADOR'));

router.post('/', crearGrupo);

router.put('/:id', actualizarGrupo);

router.delete('/:id', desactivarGrupo);


module.exports = router;