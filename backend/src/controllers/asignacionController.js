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

                ac.color,

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

                ac.color,

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

/*
 * Inserta una asignación validando campos, horario
 * y conflictos de salón/docente/grupo.
 *
 * `db` puede ser el pool o un client de transacción.
 * Lanza errores con `{ status, mensaje }` para que
 * los handlers respondan el código correcto.
 */

const insertarAsignacionInterna = async (db, datos) => {

    const {
        docente_id,
        materia_id,
        grupo_id,
        salon_id,
        periodo_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        color
    } = datos;


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

        throw {
            status: 400,
            mensaje: 'Todos los campos son obligatorios'
        };
    }


    // Validar día de la semana
    if (dia_semana < 1 || dia_semana > 7) {

        throw {
            status: 400,
            mensaje: 'El día de la semana debe estar entre 1 y 7'
        };
    }


    // Validar que la hora inicial sea menor
    if (hora_inicio >= hora_fin) {

        throw {
            status: 400,
            mensaje: 'La hora de inicio debe ser menor que la hora de fin'
        };
    }


    /*
     * VALIDAR QUE EL SALÓN NO ESTÉ OCUPADO
     */

    const conflictoSalon = await db.query(`
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

        throw {
            status: 409,
            mensaje: 'El salón ya está ocupado en ese horario'
        };
    }


    /*
     * VALIDAR QUE EL DOCENTE NO TENGA OTRA CLASE
     */

    const conflictoDocente = await db.query(`
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

        throw {
            status: 409,
            mensaje: 'El docente ya tiene una clase en ese horario'
        };
    }


    /*
     * VALIDAR QUE EL GRUPO NO TENGA OTRA CLASE
     */

    const conflictoGrupo = await db.query(`
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

        throw {
            status: 409,
            mensaje: 'El grupo ya tiene una clase en ese horario'
        };
    }


    /*
     * CREAR LA ASIGNACIÓN
     */

    const result = await db.query(`
        INSERT INTO asignacion_clase (
            docente_id,
            materia_id,
            grupo_id,
            salon_id,
            periodo_id,
            dia_semana,
            hora_inicio,
            hora_fin,
            color,
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
            $9,
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
        hora_fin,
        color || '#1558c7'
    ]);


    return result.rows[0];
};


const crearAsignacion = async (req, res) => {

    try {

        const fila =
            await insertarAsignacionInterna(pool, req.body);


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
                    fila.id
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
            ...fila,
            sesiones_generadas: sesionesGeneradas
        });

    } catch (error) {

        if (error.status) {

            return res.status(error.status).json({
                mensaje: error.mensaje
            });
        }

        console.error('Error al crear asignación:', error);

        res.status(500).json({
            mensaje: 'Error al crear la asignación'
        });
    }
};


const crearAsignacionesMasivas = async (req, res) => {

    const {
        periodo_id,
        docente_id,
        color,
        asignaciones
    } = req.body;


    if (!periodo_id || !docente_id) {

        return res.status(400).json({
            mensaje: 'periodo_id y docente_id son obligatorios'
        });
    }


    if (
        !Array.isArray(asignaciones) ||
        asignaciones.length === 0
    ) {

        return res.status(400).json({
            mensaje: 'Debes registrar al menos una clase'
        });
    }


    /*
     * Todo el lote se inserta en una sola transacción:
     * si alguna fila falla, no se guarda ninguna.
     */

    const client = await pool.connect();

    const creadas = [];

    let sesionesGeneradas = 0;

    try {

        await client.query('BEGIN');

        for (const fila of asignaciones) {

            const insertada =
                await insertarAsignacionInterna(client, {
                    ...fila,
                    periodo_id,
                    docente_id,
                    color: color || '#1558c7'
                });

            creadas.push(insertada);


            const sesiones =
                await generarSesionesDeAsignacion(
                    insertada.id,
                    client
                );

            if (sesiones !== null) {
                sesionesGeneradas += sesiones.length;
            }
        }

        await client.query('COMMIT');

    } catch (error) {

        await client.query('ROLLBACK');

        if (error.status) {

            return res.status(error.status).json({
                mensaje: error.mensaje
            });
        }

        console.error(
            'Error al crear asignaciones masivas:',
            error
        );

        return res.status(500).json({
            mensaje: 'Error al crear las asignaciones'
        });

    } finally {

        client.release();
    }


    res.status(201).json({
        mensaje: `${creadas.length} clases registradas correctamente`,
        creadas,
        sesiones_generadas: sesionesGeneradas
    });
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
            hora_fin,
            color
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
                hora_fin = $8,
                color = $10
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
            id,
            color || '#1558c7'
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
    crearAsignacionesMasivas,
    actualizarAsignacion,
    desactivarAsignacion
};