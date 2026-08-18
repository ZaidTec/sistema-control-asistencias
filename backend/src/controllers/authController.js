const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const login = async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {

            return res.status(400).json({
                mensaje: 'Username y password son obligatorios'
            });
        }


        const result = await pool.query(`
            SELECT
                id,
                username,
                password_hash,
                rol,
                activo
            FROM usuario
            WHERE username = $1;
        `, [username]);


        if (result.rows.length === 0) {

            return res.status(401).json({
                mensaje: 'Credenciales incorrectas'
            });
        }


        const usuario = result.rows[0];


        if (!usuario.activo) {

            return res.status(403).json({
                mensaje: 'La cuenta está desactivada'
            });
        }


        const passwordValido = await bcrypt.compare(
            password,
            usuario.password_hash
        );


        if (!passwordValido) {

            return res.status(401).json({
                mensaje: 'Credenciales incorrectas'
            });
        }


        const token = jwt.sign(
            {
                id: usuario.id,
                username: usuario.username,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        );


        res.json({
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                rol: usuario.rol
            }
        });

    } catch (error) {

        console.error('Error en login:', error);

        res.status(500).json({
            mensaje: 'Error al iniciar sesión'
        });
    }
};


const registro = async (req, res) => {

    try {

        const { username, password, rol } = req.body;

        if (!username || !password || !rol) {

            return res.status(400).json({
                mensaje: 'username, password y rol son obligatorios'
            });
        }

        const rolNormalizado = rol.trim().toUpperCase();

        const rolesPermitidos = ['ADMINISTRADOR', 'USUARIO'];

        if (!rolesPermitidos.includes(rolNormalizado)) {

            return res.status(400).json({
                mensaje: 'Rol no válido. Use ADMINISTRADOR o USUARIO'
            });
        }


        const salt = await bcrypt.genSalt(10);

        const passwordHash = await bcrypt.hash(password, salt);


        const result = await pool.query(`
            INSERT INTO usuario (
                username,
                password_hash,
                rol,
                activo
            )
            VALUES ($1, $2, $3, true)
            RETURNING id, username, rol, activo;
        `, [username, passwordHash, rolNormalizado]);


        const token = jwt.sign(
            {
                id: result.rows[0].id,
                username: result.rows[0].username,
                rol: result.rows[0].rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        );


        res.status(201).json({
            token,
            usuario: result.rows[0]
        });

    } catch (error) {

        if (error.code === '23505') {

            return res.status(409).json({
                mensaje: 'El nombre de usuario ya existe'
            });
        }

        console.error('Error en registro:', error);

        res.status(500).json({
            mensaje: 'Error al registrar usuario'
        });
    }
};


const verificarToken = async (req, res) => {

    res.json({
        usuario: req.usuario
    });
};


module.exports = {
    login,
    registro,
    verificarToken
};
