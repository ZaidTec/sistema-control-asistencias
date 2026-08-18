const pool = require('../config/database');


const obtenerReporteAsistencias = async (req, res) => {

    try {

        const {
            periodo_id,
            docente_id,
            fecha_inicio,
            fecha_fin,
            estado
        } = req.query;


        let query = `
            SELECT
                ra.id,
                sc.fecha,
                CONCAT(
                    d.nombre, ' ',
                    d.apellido_p, ' ',
                    d.apellido_m
                ) AS docente,
                m.clave AS materia_clave,
                m.nombre AS materia,
                g.clave AS grupo,
                s.numero AS salon,
                sc.hora_inicio,
                sc.hora_fin,
                COALESCE(ra.estado, 'PENDIENTE') AS estado,
                ra.observaciones
            FROM sesion_clase sc

            INNER JOIN asignacion_clase ac
                ON sc.asignacion_id = ac.id

            INNER JOIN docente d
                ON ac.docente_id = d.id

            INNER JOIN materia m
                ON ac.materia_id = m.id

            INNER JOIN grupo g
                ON ac.grupo_id = g.id

            INNER JOIN salon s
                ON ac.salon_id = s.id

            INNER JOIN periodo_escolar p
                ON ac.periodo_id = p.id

            LEFT JOIN registro_asistencia ra
                ON ra.sesion_clase_id = sc.id

            WHERE 1=1
        `;

        const params = [];

        let paramIndex = 1;


        if (periodo_id) {

            query += ` AND ac.periodo_id = $${paramIndex}`;
            params.push(periodo_id);
            paramIndex++;
        }


        if (docente_id) {

            query += ` AND ac.docente_id = $${paramIndex}`;
            params.push(docente_id);
            paramIndex++;
        }


        if (fecha_inicio) {

            query += ` AND sc.fecha >= $${paramIndex}`;
            params.push(fecha_inicio);
            paramIndex++;
        }


        if (fecha_fin) {

            query += ` AND sc.fecha <= $${paramIndex}`;
            params.push(fecha_fin);
            paramIndex++;
        }


        if (estado) {

            if (estado.toUpperCase() === 'PENDIENTE') {

                query += ` AND ra.estado IS NULL`;

            } else {

                query += ` AND UPPER(ra.estado) = UPPER($${paramIndex})`;
                params.push(estado);
                paramIndex++;
            }
        }


        query += `
            ORDER BY
                sc.fecha DESC,
                sc.hora_inicio DESC;
        `;


        const result = await pool.query(query, params);

        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener reporte de asistencias:', error);

        res.status(500).json({
            mensaje: 'Error al obtener el reporte de asistencias'
        });
    }
};


module.exports = {
    obtenerReporteAsistencias
};
