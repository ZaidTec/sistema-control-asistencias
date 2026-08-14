const pool = require('../config/database');


// Obtener periodos activos
const obtenerPeriodos = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                nombre,
                fecha_inicio,
                fecha_fin,
                activo
            FROM periodo_escolar
            WHERE activo = true
            ORDER BY fecha_inicio DESC;
        `);

        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener periodos:', error);

        res.status(500).json({
            mensaje: 'Error al obtener los periodos escolares'
        });
    }
};


// Obtener periodo por ID
const obtenerPeriodoPorId = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                id,
                nombre,
                fecha_inicio,
                fecha_fin,
                activo
            FROM periodo_escolar
            WHERE id = $1;
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Periodo escolar no encontrado'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al obtener periodo:', error);

        res.status(500).json({
            mensaje: 'Error al obtener el periodo escolar'
        });
    }
};


// Crear periodo
const crearPeriodo = async (req, res) => {

    try {

        const {
            nombre,
            fecha_inicio,
            fecha_fin
        } = req.body;


        if (!nombre || !fecha_inicio || !fecha_fin) {

            return res.status(400).json({
                mensaje: 'Nombre, fecha de inicio y fecha de fin son obligatorios'
            });
        }


        if (fecha_inicio >= fecha_fin) {

            return res.status(400).json({
                mensaje: 'La fecha de inicio debe ser anterior a la fecha de fin'
            });
        }


        const result = await pool.query(`
            INSERT INTO periodo_escolar (
                nombre,
                fecha_inicio,
                fecha_fin,
                activo
            )
            VALUES ($1, $2, $3, true)
            RETURNING *;
        `, [
            nombre,
            fecha_inicio,
            fecha_fin
        ]);


        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error('Error al crear periodo:', error);

        res.status(500).json({
            mensaje: 'Error al crear el periodo escolar'
        });
    }
};


// Actualizar periodo
const actualizarPeriodo = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            fecha_inicio,
            fecha_fin
        } = req.body;


        if (!nombre || !fecha_inicio || !fecha_fin) {

            return res.status(400).json({
                mensaje: 'Nombre, fecha de inicio y fecha de fin son obligatorios'
            });
        }


        if (fecha_inicio >= fecha_fin) {

            return res.status(400).json({
                mensaje: 'La fecha de inicio debe ser anterior a la fecha de fin'
            });
        }


        const result = await pool.query(`
            UPDATE periodo_escolar
            SET
                nombre = $1,
                fecha_inicio = $2,
                fecha_fin = $3
            WHERE id = $4
            RETURNING *;
        `, [
            nombre,
            fecha_inicio,
            fecha_fin,
            id
        ]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Periodo escolar no encontrado'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al actualizar periodo:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar el periodo escolar'
        });
    }
};


// Desactivar periodo
const desactivarPeriodo = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            UPDATE periodo_escolar
            SET activo = false
            WHERE id = $1
            RETURNING *;
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Periodo escolar no encontrado'
            });
        }


        res.json({
            mensaje: 'Periodo escolar desactivado correctamente',
            periodo: result.rows[0]
        });

    } catch (error) {

        console.error('Error al desactivar periodo:', error);

        res.status(500).json({
            mensaje: 'Error al desactivar el periodo escolar'
        });
    }
};


module.exports = {
    obtenerPeriodos,
    obtenerPeriodoPorId,
    crearPeriodo,
    actualizarPeriodo,
    desactivarPeriodo
};