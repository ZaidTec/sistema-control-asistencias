const express = require('express');

const {
    login,
    registro,
    verificarToken
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/rolMiddleware');

const router = express.Router();


router.post('/login', login);

router.post('/registro', authMiddleware, requireRole('ADMINISTRADOR'), registro);

router.get('/verificar', authMiddleware, verificarToken);


module.exports = router;
