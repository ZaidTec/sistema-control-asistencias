const pool = require('../config/database');
const bcrypt = require('bcrypt');


const obtenerUsuarios = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                username,
                rol,
                activo
            FROM usuario
            ORDER BY id;
        `);

        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener usuarios:', error);

        res.status(500).json({
            mensaje: 'Error al obtener los usuarios'
        });
    }
};


const obtenerUsuarioPorId = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                id,
                username,
                rol,
                activo
            FROM usuario
            WHERE id = $1;
        `, [id]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al obtener usuario:', error);

        res.status(500).json({
            mensaje: 'Error al obtener el usuario'
        });
    }
};


const crearUsuario = async (req, res) => {

    try {

        const { username, password, rol, activo } = req.body;

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

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(`
            INSERT INTO usuario (
                username,
                password_hash,
                rol,
                activo
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, rol, activo;
        `, [
            username,
            passwordHash,
            rolNormalizado,
            activo !== undefined ? activo : true
        ]);

        res.status(201).json(result.rows[0]);

    } catch (error) {

        if (error.code === '23505') {

            return res.status(409).json({
                mensaje: 'El nombre de usuario ya existe'
            });
        }

        console.error('Error al crear usuario:', error);

        res.status(500).json({
            mensaje: 'Error al crear el usuario'
        });
    }
};


const actualizarUsuario = async (req, res) => {

    try {

        const { id } = req.params;

        const { username, password, rol, activo } = req.body;

        if (username === undefined && password === undefined && rol === undefined && activo === undefined) {

            return res.status(400).json({
                mensaje: 'Al menos un campo debe proporcionarse para actualizar'
            });
        }

        let rolNormalizado;

        if (rol !== undefined) {

            rolNormalizado = rol.trim().toUpperCase();

            const rolesPermitidos = ['ADMINISTRADOR', 'USUARIO'];

            if (!rolesPermitidos.includes(rolNormalizado)) {

                return res.status(400).json({
                    mensaje: 'Rol no válido. Use ADMINISTRADOR o USUARIO'
                });
            }
        }

        const campos = [];
        const params = [];
        let indice = 1;

        if (username !== undefined) {

            campos.push(`username = $${indice++}`);
            params.push(username);
        }

        if (password !== undefined) {

            const passwordHash = await bcrypt.hash(password, 10);

            campos.push(`password_hash = $${indice++}`);
            params.push(passwordHash);
        }

        if (rolNormalizado !== undefined) {

            campos.push(`rol = $${indice++}`);
            params.push(rolNormalizado);
        }

        if (activo !== undefined) {

            campos.push(`activo = $${indice++}`);
            params.push(activo);
        }

        params.push(id);

        const query = `
            UPDATE usuario
            SET ${campos.join(', ')}
            WHERE id = $${indice}
            RETURNING id, username, rol, activo;
        `;

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        if (error.code === '23505') {

            return res.status(409).json({
                mensaje: 'El nombre de usuario ya existe'
            });
        }

        console.error('Error al actualizar usuario:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar el usuario'
        });
    }
};


const desactivarUsuario = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            UPDATE usuario
            SET activo = false
            WHERE id = $1
            RETURNING id, username, rol, activo;
        `, [id]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            mensaje: 'Usuario desactivado correctamente',
            usuario: result.rows[0]
        });

    } catch (error) {

        console.error('Error al desactivar usuario:', error);

        res.status(500).json({
            mensaje: 'Error al desactivar el usuario'
        });
    }
};


module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario
};
