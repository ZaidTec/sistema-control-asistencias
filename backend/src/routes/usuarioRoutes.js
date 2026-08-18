const express = require('express');

const {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario
} = require('../controllers/usuarioController');

const requireRole = require('../middleware/rolMiddleware');

const router = express.Router();


router.use(requireRole('ADMINISTRADOR'));

router.get('/', obtenerUsuarios);

router.get('/:id', obtenerUsuarioPorId);

router.post('/', crearUsuario);

router.put('/:id', actualizarUsuario);

router.delete('/:id', desactivarUsuario);


module.exports = router;
