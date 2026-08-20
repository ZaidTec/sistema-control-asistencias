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
            hora_fin,
            color
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

const crearAsignacionesMasivas = async (req, res) => {

    const { periodo_id, docente_id, clases } = req.body;

    if (!periodo_id || !docente_id || !Array.isArray(clases) || clases.length === 0) {
        return res.status(400).json({
            mensaje: 'El periodo, el docente y al menos una clase son obligatorios'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const creadas = [];

        const seSuperponen = (primera, segunda) => (
            primera.dia_semana === segunda.dia_semana &&
            primera.hora_inicio < segunda.hora_fin &&
            primera.hora_fin > segunda.hora_inicio
        );

        for (let indice = 0; indice < clases.length; indice += 1) {
            const clase = clases[indice];
            const { materia_id, grupo_id, salon_id, dia_semana, hora_inicio, hora_fin } = clase;

            if (!materia_id || !grupo_id || !salon_id || !dia_semana || !hora_inicio || !hora_fin) {
                throw Object.assign(new Error('Completa todos los campos de la fila'), { status: 400, indice });
            }

            if (Number(dia_semana) < 1 || Number(dia_semana) > 7) {
                throw Object.assign(new Error('El día de la semana no es válido'), { status: 400, indice });
            }

            if (hora_inicio >= hora_fin) {
                throw Object.assign(new Error('La hora de inicio debe ser menor que la hora de fin'), { status: 400, indice });
            }

            for (let anterior = 0; anterior < indice; anterior += 1) {
                const claseAnterior = clases[anterior];

                if (!seSuperponen(clase, claseAnterior)) {
                    continue;
                }

                if (Number(clase.salon_id) === Number(claseAnterior.salon_id)) {
                    throw Object.assign(new Error(`El salón está repetido con la fila ${anterior + 1} en ese horario`), { status: 409, indice });
                }

                if (Number(clase.grupo_id) === Number(claseAnterior.grupo_id)) {
                    throw Object.assign(new Error(`El grupo está repetido con la fila ${anterior + 1} en ese horario`), { status: 409, indice });
                }

                throw Object.assign(new Error(`El docente está repetido con la fila ${anterior + 1} en ese horario`), { status: 409, indice });
            }

            const conflicto = await client.query(`
                SELECT
                    CASE WHEN salon_id = $3 THEN 'El salón ya está ocupado en ese horario' END AS conflicto_salon,
                    CASE WHEN docente_id = $2 THEN 'El docente ya tiene una clase en ese horario' END AS conflicto_docente,
                    CASE WHEN grupo_id = $4 THEN 'El grupo ya tiene una clase en ese horario' END AS conflicto_grupo
                FROM asignacion_clase
                WHERE periodo_id = $1
                  AND dia_semana = $5
                  AND activo = true
                  AND hora_inicio < $7
                  AND hora_fin > $6
                  AND (salon_id = $3 OR docente_id = $2 OR grupo_id = $4)
                LIMIT 1;
            `, [periodo_id, docente_id, salon_id, grupo_id, dia_semana, hora_inicio, hora_fin]);

            if (conflicto.rows.length > 0) {
                const conflictoEncontrado = conflicto.rows[0];
                const mensajeConflicto = conflictoEncontrado.conflicto_salon
                    || conflictoEncontrado.conflicto_docente
                    || conflictoEncontrado.conflicto_grupo;

                throw Object.assign(new Error(mensajeConflicto), { status: 409, indice });
            }

            const result = await client.query(`
                INSERT INTO asignacion_clase (
                    docente_id, materia_id, grupo_id, salon_id, periodo_id,
                    dia_semana, hora_inicio, hora_fin, activo
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
                RETURNING *;
            `, [docente_id, materia_id, grupo_id, salon_id, periodo_id, dia_semana, hora_inicio, hora_fin]);

            creadas.push(result.rows[0]);
        }

        await client.query('COMMIT');

        for (const asignacion of creadas) {
            try {
                await generarSesionesDeAsignacion(asignacion.id);
            } catch (error) {
                console.error('Error al generar sesiones automáticamente:', error);
            }
        }

        return res.status(201).json({
            mensaje: `${creadas.length} horarios registrados correctamente`,
            creadas
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(error.status || 500).json({
            mensaje: error.message || 'Error al crear los horarios',
            fila: Number.isInteger(error.indice) ? error.indice + 1 : undefined
        });
    } finally {
        client.release();
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