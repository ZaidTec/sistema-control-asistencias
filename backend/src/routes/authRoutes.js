const express = require('express');

const {
    login,
    registro,
    verificarToken
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/rolMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        mensaje: 'Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.'
    }
});

router.post('/login', loginLimiter, login);

router.post('/registro', authMiddleware, requireRole('ADMINISTRADOR'), registro);

router.get('/verificar', authMiddleware, verificarToken);


module.exports = router;
