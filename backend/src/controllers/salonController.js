const pool = require('../config/database');


const obtenerSalones = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                numero,
                activo
            FROM salon
            ORDER BY CAST(numero AS INTEGER);
        `);

        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener salones:', error);

        res.status(500).json({
            mensaje: 'Error al obtener los salones'
        });
    }
};


const obtenerSalonPorId = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                id,
                numero
            FROM salon
            WHERE id = $1;
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Salón no encontrado'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al obtener salón:', error);

        res.status(500).json({
            mensaje: 'Error al obtener el salón'
        });
    }
};


const crearSalon = async (req, res) => {

    try {

        const { numero } = req.body;

        if (!numero) {

            return res.status(400).json({
                mensaje: 'El número del salón es obligatorio'
            });
        }

        const result = await pool.query(`
            INSERT INTO salon (numero)
            VALUES ($1)
            RETURNING id, numero, activo;
        `, [numero]);

        res.status(201).json(result.rows[0]);

    } catch (error) {

        if (error.code === '23505') {

            return res.status(409).json({
                mensaje: 'Ya existe un salón con ese número'
            });
        }

        console.error('Error al crear salón:', error);

        res.status(500).json({
            mensaje: 'Error al crear el salón'
        });
    }
};


const actualizarSalon = async (req, res) => {

    try {

        const { id } = req.params;
        const { numero, activo } = req.body;

        if (numero !== undefined && activo !== undefined) {

            const result = await pool.query(`
                UPDATE salon
                SET
                    numero = $1,
                    activo = $2
                WHERE id = $3
                RETURNING id, numero, activo;
            `, [numero, activo, id]);

            if (result.rows.length === 0) {

                return res.status(404).json({
                    mensaje: 'Salón no encontrado'
                });
            }

            return res.json(result.rows[0]);
        }

        if (numero !== undefined) {

            const result = await pool.query(`
                UPDATE salon
                SET numero = $1
                WHERE id = $2
                RETURNING id, numero, activo;
            `, [numero, id]);

            if (result.rows.length === 0) {

                return res.status(404).json({
                    mensaje: 'Salón no encontrado'
                });
            }

            return res.json(result.rows[0]);
        }

        if (activo !== undefined) {

            const result = await pool.query(`
                UPDATE salon
                SET activo = $1
                WHERE id = $2
                RETURNING id, numero, activo;
            `, [activo, id]);

            if (result.rows.length === 0) {

                return res.status(404).json({
                    mensaje: 'Salón no encontrado'
                });
            }

            return res.json(result.rows[0]);
        }

        return res.status(400).json({
            mensaje: 'Se requiere al menos un campo para actualizar'
        });

    } catch (error) {

        if (error.code === '23505') {

            return res.status(409).json({
                mensaje: 'Ya existe un salón con ese número'
            });
        }

        console.error('Error al actualizar salón:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar el salón'
        });
    }
};


const eliminarSalon = async (req, res) => {

    try {

        const { id } = req.params;

        const tieneAsignaciones = await pool.query(`
            SELECT 1
            FROM asignacion_clase
            WHERE salon_id = $1
            LIMIT 1;
        `, [id]);

        if (tieneAsignaciones.rows.length > 0) {

            return res.status(409).json({
                mensaje: 'No se puede eliminar el salón porque tiene asignaciones'
            });
        }

        const result = await pool.query(`
            DELETE FROM salon
            WHERE id = $1
            RETURNING id;
        `, [id]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Salón no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Salón eliminado correctamente'
        });

    } catch (error) {

        console.error('Error al eliminar salón:', error);

        res.status(500).json({
            mensaje: 'Error al eliminar el salón'
        });
    }
};


module.exports = {
    obtenerSalones,
    obtenerSalonPorId,
    crearSalon,
    actualizarSalon,
    eliminarSalon
};