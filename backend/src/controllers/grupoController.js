const pool = require('../config/database');


// Obtener grupos activos
const obtenerGrupos = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                clave,
                semestre,
                activo
            FROM grupo
            WHERE activo = true
            ORDER BY semestre DESC, clave;
        `);

        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener grupos:', error);

        res.status(500).json({
            mensaje: 'Error al obtener los grupos'
        });
    }
};


// Obtener grupo por ID
const obtenerGrupoPorId = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                id,
                clave,
                semestre,
                activo
            FROM grupo
            WHERE id = $1;
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Grupo no encontrado'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al obtener grupo:', error);

        res.status(500).json({
            mensaje: 'Error al obtener el grupo'
        });
    }
};


// Crear grupo
const crearGrupo = async (req, res) => {

    try {

        const {
            clave,
            semestre
        } = req.body;


        if (!clave || !semestre) {

            return res.status(400).json({
                mensaje: 'La clave y el semestre son obligatorios'
            });
        }


        const result = await pool.query(`
            INSERT INTO grupo (
                clave,
                semestre,
                activo
            )
            VALUES ($1, $2, true)
            RETURNING *;
        `, [
            clave,
            semestre
        ]);


        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error('Error al crear grupo:', error);

        res.status(500).json({
            mensaje: 'Error al crear el grupo'
        });
    }
};


// Actualizar grupo
const actualizarGrupo = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            clave,
            semestre
        } = req.body;


        if (!clave || !semestre) {

            return res.status(400).json({
                mensaje: 'La clave y el semestre son obligatorios'
            });
        }


        const result = await pool.query(`
            UPDATE grupo
            SET
                clave = $1,
                semestre = $2
            WHERE id = $3
            RETURNING *;
        `, [
            clave,
            semestre,
            id
        ]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Grupo no encontrado'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al actualizar grupo:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar el grupo'
        });
    }
};


// Desactivar grupo
const desactivarGrupo = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            UPDATE grupo
            SET activo = false
            WHERE id = $1
            RETURNING *;
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Grupo no encontrado'
            });
        }


        res.json({
            mensaje: 'Grupo desactivado correctamente',
            grupo: result.rows[0]
        });

    } catch (error) {

        console.error('Error al desactivar grupo:', error);

        res.status(500).json({
            mensaje: 'Error al desactivar el grupo'
        });
    }
};


module.exports = {
    obtenerGrupos,
    obtenerGrupoPorId,
    crearGrupo,
    actualizarGrupo,
    desactivarGrupo
};