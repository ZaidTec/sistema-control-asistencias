const pool = require('../config/database');
const ZONA_HORARIA = process.env.APP_TIMEZONE || 'America/Mexico_City';


const obtenerSesiones = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                sc.id,
                sc.fecha,
                sc.hora_inicio,
                sc.hora_fin,

                ac.id AS asignacion_id,

                CONCAT(
                    d.nombre, ' ',
                    d.apellido_p, ' ',
                    d.apellido_m
                ) AS docente,

                m.clave AS materia_clave,
                m.nombre AS materia,

                g.clave AS grupo,

                s.numero AS salon,

                p.nombre AS periodo

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

            ORDER BY
                sc.fecha,
                sc.hora_inicio;
        `);


        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener sesiones:', error);

        res.status(500).json({
            mensaje: 'Error al obtener las sesiones'
        });
    }
};

const generarSesionesDeAsignacion = async (asignacion_id, client) => {

    /*
     * Si se recibe un client (transacción), se usa; si no, pool.
     */

    const db = client || pool;


    /*
     * Obtener información de la asignación
     */

    const asignacionResult = await db.query(`
        SELECT
            ac.id,
            ac.dia_semana,
            ac.hora_inicio,
            ac.hora_fin,

            p.fecha_inicio,
            p.fecha_fin

        FROM asignacion_clase ac

        INNER JOIN periodo_escolar p
            ON ac.periodo_id = p.id

        WHERE ac.id = $1
          AND ac.activo = true;
    `, [asignacion_id]);


    if (asignacionResult.rows.length === 0) {
        return null;
    }


    const asignacion = asignacionResult.rows[0];


    /*
     * Convertimos fechas.
     *
     * pg devuelve las columnas `date` como objetos Date
     * (medianoche local), no como strings.
     */

    const fechaInicio = new Date(
        asignacion.fecha_inicio
    );

    const fechaFin = new Date(
        asignacion.fecha_fin
    );


    const sesiones = [];


    /*
     * PostgreSQL:
     *
     * 0 = Domingo
     * 1 = Lunes
     * 2 = Martes
     * ...
     * 6 = Sábado
     *
     * Nosotros usamos:
     *
     * 1 = Lunes
     * 2 = Martes
     * ...
     * 7 = Domingo
     */


    const diaObjetivo =
        asignacion.dia_semana === 7
            ? 0
            : asignacion.dia_semana;


    for (
        let fecha = new Date(fechaInicio);
        fecha <= fechaFin;
        fecha.setDate(fecha.getDate() + 1)
    ) {

        if (fecha.getDay() === diaObjetivo) {

            const fechaSQL = [
                fecha.getFullYear(),
                String(fecha.getMonth() + 1).padStart(2, '0'),
                String(fecha.getDate()).padStart(2, '0')
            ].join('-');


            const result = await db.query(`
                INSERT INTO sesion_clase (
                    asignacion_id,
                    fecha,
                    hora_inicio,
                    hora_fin
                )
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (asignacion_id, fecha)
                DO NOTHING
                RETURNING *;
            `, [
                asignacion_id,
                fechaSQL,
                asignacion.hora_inicio,
                asignacion.hora_fin
            ]);


            if (result.rows.length > 0) {

                sesiones.push(result.rows[0]);
            }
        }
    }


    return sesiones;
};


const generarSesiones = async (req, res) => {

    try {

        const { asignacion_id } = req.body;


        if (!asignacion_id) {

            return res.status(400).json({
                mensaje: 'El asignacion_id es obligatorio'
            });
        }


        const sesiones =
            await generarSesionesDeAsignacion(asignacion_id);


        if (sesiones === null) {

            return res.status(404).json({
                mensaje: 'Asignación no encontrada'
            });
        }


        res.status(201).json({
            mensaje: 'Sesiones generadas correctamente',
            cantidad: sesiones.length,
            sesiones
        });


    } catch (error) {

        console.error('Error al generar sesiones:', error);

        res.status(500).json({
            mensaje: 'Error al generar las sesiones'
        });
    }
};

const obtenerSesionesHoy = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                sc.id,
                sc.fecha,
                sc.hora_inicio,
                sc.hora_fin,

                ac.id AS asignacion_id,

                CONCAT(
                    d.nombre, ' ',
                    d.apellido_p, ' ',
                    d.apellido_m
                ) AS docente,

                m.clave AS materia_clave,
                m.nombre AS materia,

                g.clave AS grupo,

                s.numero AS salon,

                p.nombre AS periodo,

                ra.id AS asistencia_id,
                ra.estado AS asistencia_estado,
                ra.observaciones AS asistencia_observaciones

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

            LEFT JOIN LATERAL (
                SELECT
                    ra.id,
                    ra.estado,
                    ra.observaciones
                FROM registro_asistencia ra
                WHERE ra.sesion_clase_id = sc.id
                ORDER BY ra.id DESC
                LIMIT 1
            ) ra ON true

            WHERE sc.fecha = (CURRENT_TIMESTAMP AT TIME ZONE $1)::date

            ORDER BY sc.hora_inicio;
        `, [ZONA_HORARIA]);


        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener sesiones de hoy:', error);

        res.status(500).json({
            mensaje: 'Error al obtener las sesiones de hoy'
        });
    }
};

const obtenerSesionesPorFecha = async (req, res) => {

    try {

        const { fecha } = req.params;


        const result = await pool.query(`
            SELECT
                sc.id,
                sc.fecha,
                sc.hora_inicio,
                sc.hora_fin,

                ac.id AS asignacion_id,

                CONCAT(
                    d.nombre, ' ',
                    d.apellido_p, ' ',
                    d.apellido_m
                ) AS docente,

                m.clave AS materia_clave,
                m.nombre AS materia,

                g.clave AS grupo,

                s.numero AS salon,

                p.nombre AS periodo,

                ra.id AS asistencia_id,
                ra.estado AS asistencia_estado,
                ra.observaciones AS asistencia_observaciones

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

            WHERE sc.fecha = $1

            ORDER BY sc.hora_inicio;
        `, [fecha]);


        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener sesiones por fecha:', error);

        res.status(500).json({
            mensaje: 'Error al obtener las sesiones'
        });
    }
};


module.exports = {
    obtenerSesiones,
    generarSesiones,
    generarSesionesDeAsignacion,
    obtenerSesionesHoy,
    obtenerSesionesPorFecha
};