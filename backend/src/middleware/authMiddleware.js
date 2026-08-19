const jwt = require('jsonwebtoken');
const pool = require('../config/database');


const authMiddleware = async (req, res, next) => {

    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith('Bearer ')) {

        return res.status(401).json({
            mensaje: 'Token de autenticación no proporcionado'
        });
    }


    const token = authHeader.split(' ')[1];


    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ['HS256'] }
        );

        const result = await pool.query(`
            SELECT id, username, rol, activo
            FROM usuario
            WHERE id = $1;
        `, [decoded.id]);

        const usuario = result.rows[0];

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                mensaje: 'La sesión ya no es válida'
            });
        }

        req.usuario = {
            id: usuario.id,
            username: usuario.username,
            rol: usuario.rol
        };

        next();

    } catch (error) {

        if (error.name === 'TokenExpiredError') {

            return res.status(401).json({
                mensaje: 'Token expirado'
            });
        }

        console.error('Error al validar autenticación:', error);

        return res.status(401).json({
            mensaje: 'Token inválido'
        });
    }
};


module.exports = authMiddleware;
