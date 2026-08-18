const pool = require('../config/database');

const { generarSesionesDeAsignacion } =
    require('./sesionController');


// Obtener todas las asignaciones activas
const obtenerAsignaciones = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                ac.id,

                ac.docente_id,
                CONCAT(
                    d.nombre, ' ',
                    d.apellido_p, ' ',
                    d.apellido_m
                ) AS docente,

                ac.materia_id,
                m.clave AS materia_clave,
                m.nombre AS materia,

                ac.grupo_id,
                g.clave AS grupo,

                ac.salon_id,
                s.numero AS salon,

                ac.periodo_id,
                p.nombre AS periodo,

                ac.dia_semana,
                ac.hora_inicio,
                ac.hora_fin,

                ac.activo

            FROM asignacion_clase ac

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

            WHERE ac.activo = true

            ORDER BY
                ac.dia_semana,
                ac.hora_inicio;
        `);


        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener asignaciones:', error);

        res.status(500).json({
            mensaje: 'Error al obtener las asignaciones'
        });
    }
};

const obtenerAsignacionPorId = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                ac.id,

                ac.docente_id,
                CONCAT(
                    d.nombre, ' ',
                    d.apellido_p, ' ',
                    d.apellido_m
                ) AS docente,

                ac.materia_id,
                m.clave AS materia_clave,
                m.nombre AS materia,

                ac.grupo_id,
                g.clave AS grupo,

                ac.salon_id,
                s.numero AS salon,

                ac.periodo_id,
                p.nombre AS periodo,

                ac.dia_semana,
                ac.hora_inicio,
                ac.hora_fin,

                ac.activo

            FROM asignacion_clase ac

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

            WHERE ac.id = $1;
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Asignación no encontrada'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Error al obtener asignación:', error);

        res.status(500).json({
            mensaje: 'Error al obtener la asignación'
        });
    }
};

const crearAsignacion = async (req, res) => {

    try {

        const {
            docente_id,
            materia_id,
            grupo_id,
            salon_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin
        } = req.body;


        // Validar campos obligatorios
        if (
            !docente_id ||
            !materia_id ||
            !grupo_id ||
            !salon_id ||
            !periodo_id ||
            !dia_semana ||
            !hora_inicio ||
            !hora_fin
        ) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }


        // Validar día de la semana
        if (dia_semana < 1 || dia_semana > 7) {
            return res.status(400).json({
                mensaje: 'El día de la semana debe estar entre 1 y 7'
            });
        }


        // Validar que la hora inicial sea menor
        if (hora_inicio >= hora_fin) {
            return res.status(400).json({
                mensaje: 'La hora de inicio debe ser menor que la hora de fin'
            });
        }


        /*
         * VALIDAR QUE EL SALÓN NO ESTÉ OCUPADO
         */

        const conflictoSalon = await pool.query(`
            SELECT id
            FROM asignacion_clase
            WHERE salon_id = $1
              AND periodo_id = $2
              AND dia_semana = $3
              AND activo = true
              AND hora_inicio < $5
              AND hora_fin > $4;
        `, [
            salon_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin
        ]);


        if (conflictoSalon.rows.length > 0) {

            return res.status(409).json({
                mensaje: 'El salón ya está ocupado en ese horario'
            });
        }


        /*
         * VALIDAR QUE EL DOCENTE NO TENGA OTRA CLASE
         */

        const conflictoDocente = await pool.query(`
            SELECT id
            FROM asignacion_clase
            WHERE docente_id = $1
              AND periodo_id = $2
              AND dia_semana = $3
              AND activo = true
              AND hora_inicio < $5
              AND hora_fin > $4;
        `, [
            docente_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin
        ]);


        if (conflictoDocente.rows.length > 0) {

            return res.status(409).json({
                mensaje: 'El docente ya tiene una clase en ese horario'
            });
        }


        /*
         * VALIDAR QUE EL GRUPO NO TENGA OTRA CLASE
         */

        const conflictoGrupo = await pool.query(`
            SELECT id
            FROM asignacion_clase
            WHERE grupo_id = $1
              AND periodo_id = $2
              AND dia_semana = $3
              AND activo = true
              AND hora_inicio < $5
              AND hora_fin > $4;
        `, [
            grupo_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin
        ]);


        if (conflictoGrupo.rows.length > 0) {

            return res.status(409).json({
                mensaje: 'El grupo ya tiene una clase en ese horario'
            });
        }


        /*
         * CREAR LA ASIGNACIÓN
         */

        const result = await pool.query(`
            INSERT INTO asignacion_clase (
                docente_id,
                materia_id,
                grupo_id,
                salon_id,
                periodo_id,
                dia_semana,
                hora_inicio,
                hora_fin,
                activo
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                true
            )
            RETURNING *;
        `, [
            docente_id,
            materia_id,
            grupo_id,
            salon_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin
        ]);


        /*
         * GENERAR SESIONES DEL PERIODO
         *
         * Al crear el horario se generan automáticamente
         * todas sus sesiones dentro del periodo escolar.
         * Es idempotente: no crea duplicados.
         */

        let sesionesGeneradas = 0;

        try {

            const sesiones =
                await generarSesionesDeAsignacion(
                    result.rows[0].id
                );

            if (sesiones !== null) {
                sesionesGeneradas = sesiones.length;
            }

        } catch (error) {

            console.error(
                'Error al generar sesiones automáticamente:',
                error
            );
        }


        res.status(201).json({
            ...result.rows[0],
            sesiones_generadas: sesionesGeneradas
        });

    } catch (error) {

        console.error('Error al crear asignación:', error);

        res.status(500).json({
            mensaje: 'Error al crear la asignación'
        });
    }
};

const actualizarAsignacion = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            docente_id,
            materia_id,
            grupo_id,
            salon_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin
        } = req.body;


        if (
            !docente_id ||
            !materia_id ||
            !grupo_id ||
            !salon_id ||
            !periodo_id ||
            !dia_semana ||
            !hora_inicio ||
            !hora_fin
        ) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }


        if (dia_semana < 1 || dia_semana > 7) {
            return res.status(400).json({
                mensaje: 'El día de la semana debe estar entre 1 y 7'
            });
        }


        if (hora_inicio >= hora_fin) {
            return res.status(400).json({
                mensaje: 'La hora de inicio debe ser menor que la hora de fin'
            });
        }


        /*
         * Verificar que la asignación exista
         */

        const existe = await pool.query(`
            SELECT id
            FROM asignacion_clase
            WHERE id = $1
              AND activo = true;
        `, [id]);


        if (existe.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Asignación no encontrada'
            });
        }


        /*
         * CONFLICTO DE SALÓN
         */

        const conflictoSalon = await pool.query(`
            SELECT id
            FROM asignacion_clase
            WHERE salon_id = $1
              AND periodo_id = $2
              AND dia_semana = $3
              AND activo = true
              AND id <> $6
              AND hora_inicio < $5
              AND hora_fin > $4;
        `, [
            salon_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin,
            id
        ]);


        if (conflictoSalon.rows.length > 0) {

            return res.status(409).json({
                mensaje: 'El salón ya está ocupado en ese horario'
            });
        }


        /*
         * CONFLICTO DE DOCENTE
         */

        const conflictoDocente = await pool.query(`
            SELECT id
            FROM asignacion_clase
            WHERE docente_id = $1
              AND periodo_id = $2
              AND dia_semana = $3
              AND activo = true
              AND id <> $6
              AND hora_inicio < $5
              AND hora_fin > $4;
        `, [
            docente_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin,
            id
        ]);


        if (conflictoDocente.rows.length > 0) {

            return res.status(409).json({
                mensaje: 'El docente ya tiene una clase en ese horario'
            });
        }


        /*
         * CONFLICTO DE GRUPO
         */

        const conflictoGrupo = await pool.query(`
            SELECT id
            FROM asignacion_clase
            WHERE grupo_id = $1
              AND periodo_id = $2
              AND dia_semana = $3
              AND activo = true
              AND id <> $6
              AND hora_inicio < $5
              AND hora_fin > $4;
        `, [
            grupo_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin,
            id
        ]);


        if (conflictoGrupo.rows.length > 0) {

            return res.status(409).json({
                mensaje: 'El grupo ya tiene una clase en ese horario'
            });
        }


        /*
         * ACTUALIZAR
         */

        const result = await pool.query(`
            UPDATE asignacion_clase
            SET
                docente_id = $1,
                materia_id = $2,
                grupo_id = $3,
                salon_id = $4,
                periodo_id = $5,
                dia_semana = $6,
                hora_inicio = $7,
                hora_fin = $8
            WHERE id = $9
            RETURNING *;
        `, [
            docente_id,
            materia_id,
            grupo_id,
            salon_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin,
            id
        ]);


        /*
         * RECALCULAR SESIONES DEL PERIODO
         *
         * Se eliminan las sesiones sin asistencia registrada
         * y se vuelven a generar con el nuevo día/horario.
         * Las sesiones que ya tienen asistencia se conservan
         * como histórico.
         */

        let sesionesGeneradas = 0;

        const client = await pool.connect();

        try {

            await client.query('BEGIN');

            await client.query(`
                DELETE FROM sesion_clase sc
                WHERE sc.asignacion_id = $1
                  AND NOT EXISTS (
                      SELECT 1
                      FROM registro_asistencia ra
                      WHERE ra.sesion_clase_id = sc.id
                  );
            `, [id]);

            const sesiones =
                await generarSesionesDeAsignacion(id, client);

            if (sesiones !== null) {
                sesionesGeneradas = sesiones.length;
            }

            await client.query('COMMIT');

        } catch (error) {

            await client.query('ROLLBACK');

            throw error;

        } finally {

            client.release();
        }


        res.json({
            ...result.rows[0],
            sesiones_generadas: sesionesGeneradas
        });

    } catch (error) {

        console.error('Error al actualizar asignación:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar la asignación'
        });
    }
};

const desactivarAsignacion = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            UPDATE asignacion_clase
            SET activo = false
            WHERE id = $1
              AND activo = true
            RETURNING *;
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Asignación no encontrada'
            });
        }


        res.json({
            mensaje: 'Asignación desactivada correctamente',
            asignacion: result.rows[0]
        });

    } catch (error) {

        console.error('Error al desactivar asignación:', error);

        res.status(500).json({
            mensaje: 'Error al desactivar la asignación'
        });
    }
};

module.exports = {
    obtenerAsignaciones,
    obtenerAsignacionPorId,
    crearAsignacion,
    actualizarAsignacion,
    desactivarAsignacion
};