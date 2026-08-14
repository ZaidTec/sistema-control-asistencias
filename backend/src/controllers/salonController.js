const pool = require('../config/database');


const obtenerSalones = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                numero
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


module.exports = {
    obtenerSalones,
    obtenerSalonPorId
};