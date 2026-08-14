const pool = require('../config/database');


// Obtener todas las materias activas
const obtenerMaterias = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                clave,
                nombre,
                activo
            FROM materia
            WHERE activo = true
            ORDER BY clave;
        `);

        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener materias:', error);

        res.status(500).json({
            mensaje: 'Error al obtener las materias'
        });
    }
};


// Obtener una materia por ID
const obtenerMateriaPorId = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                id,
                clave,
                nombre,
                activo
            FROM materia
            WHERE id = $1;
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Materia no encontrada'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al obtener materia:', error);

        res.status(500).json({
            mensaje: 'Error al obtener la materia'
        });
    }
};


// Crear una materia
const crearMateria = async (req, res) => {

    try {

        const {
            clave,
            nombre
        } = req.body;


        if (!clave || !nombre) {

            return res.status(400).json({
                mensaje: 'La clave y el nombre son obligatorios'
            });
        }


        const result = await pool.query(`
            INSERT INTO materia (
                clave,
                nombre,
                activo
            )
            VALUES ($1, $2, true)
            RETURNING *;
        `, [
            clave,
            nombre
        ]);


        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error('Error al crear materia:', error);

        res.status(500).json({
            mensaje: 'Error al crear la materia'
        });
    }
};


// Actualizar una materia
const actualizarMateria = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            clave,
            nombre
        } = req.body;


        if (!clave || !nombre) {

            return res.status(400).json({
                mensaje: 'La clave y el nombre son obligatorios'
            });
        }


        const result = await pool.query(`
            UPDATE materia
            SET
                clave = $1,
                nombre = $2
            WHERE id = $3
            RETURNING *;
        `, [
            clave,
            nombre,
            id
        ]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Materia no encontrada'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al actualizar materia:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar la materia'
        });
    }
};


// Desactivar una materia
const desactivarMateria = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            UPDATE materia
            SET activo = false
            WHERE id = $1
            RETURNING *;
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Materia no encontrada'
            });
        }


        res.json({
            mensaje: 'Materia desactivada correctamente',
            materia: result.rows[0]
        });

    } catch (error) {

        console.error('Error al desactivar materia:', error);

        res.status(500).json({
            mensaje: 'Error al desactivar la materia'
        });
    }
};


module.exports = {
    obtenerMaterias,
    obtenerMateriaPorId,
    crearMateria,
    actualizarMateria,
    desactivarMateria
};