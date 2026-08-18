const pool = require('../config/database');


const obtenerAsistencias = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT

                ra.id,

                ra.estado,
                ra.observaciones,

                sc.id AS sesion_id,
                sc.fecha,
                sc.hora_inicio,
                sc.hora_fin,

                u.id AS usuario_id,
                u.username,

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

            FROM registro_asistencia ra

            INNER JOIN sesion_clase sc
                ON ra.sesion_clase_id = sc.id

            INNER JOIN usuario u
                ON ra.usuario_id = u.id

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
                sc.fecha DESC,
                sc.hora_inicio DESC;
        `);


        res.json(result.rows);

    } catch (error) {

        console.error('Error al obtener asistencias:', error);

        res.status(500).json({
            mensaje: 'Error al obtener las asistencias'
        });
    }
};

const registrarAsistencia = async (req, res) => {

    try {

        const {
            sesion_clase_id,
            usuario_id,
            estado,
            observaciones
        } = req.body;


        /*
         * Validar campos obligatorios
         */

        if (
            !sesion_clase_id ||
            !usuario_id ||
            !estado
        ) {

            return res.status(400).json({
                mensaje: 'sesion_clase_id, usuario_id y estado son obligatorios'
            });
        }


        /*
         * Validar estado
         */

        const estadosPermitidos = [
            'PRESENTE',
            'AUSENTE',
            'RETARDO'
        ];


        if (!estadosPermitidos.includes(estado)) {

            return res.status(400).json({
                mensaje: 'Estado de asistencia no válido'
            });
        }


        /*
         * PRESENTE no debe tener observaciones
         */

        if (
            estado === 'PRESENTE' &&
            observaciones
        ) {

            return res.status(400).json({
                mensaje: 'Una asistencia presente no puede tener observaciones'
            });
        }


        /*
         * Verificar que exista la sesión
         */

        const sesion = await pool.query(`
            SELECT id
            FROM sesion_clase
            WHERE id = $1;
        `, [sesion_clase_id]);


        if (sesion.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'La sesión de clase no existe'
            });
        }


        /*
         * Verificar que exista el usuario
         */

        const usuario = await pool.query(`
            SELECT id
            FROM usuario
            WHERE id = $1
              AND activo = true;
        `, [usuario_id]);


        if (usuario.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'El usuario no existe o está inactivo'
            });
        }


        /*
         * Registrar asistencia
         */

        const result = await pool.query(`
            INSERT INTO registro_asistencia (
                sesion_clase_id,
                usuario_id,
                estado,
                observaciones
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [
            sesion_clase_id,
            usuario_id,
            estado,
            estado === 'PRESENTE'
                ? null
                : observaciones || null
        ]);


        res.status(201).json({
            mensaje: 'Asistencia registrada correctamente',
            asistencia: result.rows[0]
        });


    } catch (error) {

        /*
         * Usuario intentando registrar
         * dos veces la misma sesión
         */

        if (error.code === '23505') {

            return res.status(409).json({
                mensaje: 'El usuario ya registró asistencia para esta sesión'
            });
        }


        console.error('Error al registrar asistencia:', error);

        res.status(500).json({
            mensaje: 'Error al registrar la asistencia'
        });
    }
};

const actualizarAsistencia = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            estado,
            observaciones
        } = req.body;


        const estadosPermitidos = [
            'PRESENTE',
            'AUSENTE',
            'RETARDO'
        ];


        if (!estadosPermitidos.includes(estado)) {

            return res.status(400).json({
                mensaje: 'Estado de asistencia no válido'
            });
        }


        if (
            estado === 'PRESENTE' &&
            observaciones
        ) {

            return res.status(400).json({
                mensaje: 'Una asistencia presente no puede tener observaciones'
            });
        }


        const result = await pool.query(`
            UPDATE registro_asistencia
            SET
                estado = $1,
                observaciones = $2
            WHERE id = $3
            RETURNING *;
        `, [
            estado,
            estado === 'PRESENTE'
                ? null
                : observaciones || null,
            id
        ]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Registro de asistencia no encontrado'
            });
        }


        res.json({
            mensaje: 'Asistencia actualizada correctamente',
            asistencia: result.rows[0]
        });


    } catch (error) {

        console.error('Error al actualizar asistencia:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar la asistencia'
        });
    }
};


const eliminarAsistencia = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            DELETE FROM registro_asistencia
            WHERE id = $1
            RETURNING *;
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Registro de asistencia no encontrado'
            });
        }


        res.json({
            mensaje: 'Asistencia eliminada correctamente'
        });

    } catch (error) {

        console.error('Error al eliminar asistencia:', error);

        res.status(500).json({
            mensaje: 'Error al eliminar la asistencia'
        });
    }
};


module.exports = {
    obtenerAsistencias,
    registrarAsistencia,
    actualizarAsistencia,
    eliminarAsistencia
};