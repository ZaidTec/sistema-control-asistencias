const pool = require('../config/database');

const obtenerDocentes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                nombre,
                apellido_p,
                apellido_m,
                rfc,
                telefono,
                correo_personal,
                correo_institucional,
                activo
             FROM docente
                WHERE activo = true
                ORDER BY apellido_p, apellido_m, nombre;
        `);

        res.json(result.rows);

    } catch (error) {
        console.error('Error al obtener docentes:', error);

        res.status(500).json({
            mensaje: 'Error al obtener los docentes'
        });
    }
};


const obtenerDocentePorId = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                id,
                nombre,
                apellido_p,
                apellido_m,
                rfc,
                telefono,
                correo_personal,
                correo_institucional,
                activo
            FROM docente
            WHERE id = $1;
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Docente no encontrado'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al obtener docente:', error);

        res.status(500).json({
            mensaje: 'Error al obtener el docente'
        });
    }
};

const crearDocente = async (req, res) => {

    try {

        const {
            nombre,
            apellido_p,
            apellido_m,
            rfc,
            telefono,
            correo_personal,
            correo_institucional
        } = req.body;


        if (
            !nombre ||
            !apellido_p ||
            !apellido_m ||
            !rfc ||
            !telefono ||
            !correo_personal ||
            !correo_institucional
        ) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }


        const result = await pool.query(`
            INSERT INTO docente (
                nombre,
                apellido_p,
                apellido_m,
                rfc,
                telefono,
                correo_personal,
                correo_institucional
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `, [
            nombre,
            apellido_p,
            apellido_m,
            rfc,
            telefono,
            correo_personal,
            correo_institucional
        ]);


        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error('Error al crear docente:', error);

        res.status(500).json({
            mensaje: 'Error al crear el docente'
        });
    }
};

const actualizarDocente = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            apellido_p,
            apellido_m,
            rfc,
            telefono,
            correo_personal,
            correo_institucional
        } = req.body;


        if (
            !nombre ||
            !apellido_p ||
            !apellido_m ||
            !rfc ||
            !telefono ||
            !correo_personal ||
            !correo_institucional
        ) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }


        const result = await pool.query(`
            UPDATE docente
            SET
                nombre = $1,
                apellido_p = $2,
                apellido_m = $3,
                rfc = $4,
                telefono = $5,
                correo_personal = $6,
                correo_institucional = $7
            WHERE id = $8
            RETURNING *;
        `, [
            nombre,
            apellido_p,
            apellido_m,
            rfc,
            telefono,
            correo_personal,
            correo_institucional,
            id
        ]);


        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Docente no encontrado'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al actualizar docente:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar el docente'
        });
    }
};

const desactivarDocente = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            UPDATE docente
            SET activo = false
            WHERE id = $1
            RETURNING *;
        `, [id]);


        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Docente no encontrado'
            });
        }


        res.json({
            mensaje: 'Docente desactivado correctamente',
            docente: result.rows[0]
        });

    } catch (error) {

        console.error('Error al desactivar docente:', error);

        res.status(500).json({
            mensaje: 'Error al desactivar el docente'
        });
    }
};


module.exports = {
    obtenerDocentes,
    obtenerDocentePorId,
    crearDocente,
    actualizarDocente,
    desactivarDocente
};