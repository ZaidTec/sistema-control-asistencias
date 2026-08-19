import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarCheck,
    CheckCircle2,
    Clock,
    AlertTriangle,
    CalendarOff,
    MoreVertical,
    NotebookPen,
    AlertCircle,
    RefreshCw,
    X
} from "lucide-react";
import api from "../services/api";
import Layout from "../components/Layout";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../context/AuthContext";
import useIsMobile from "../hooks/useIsMobile";
import "../styles/dashboard.css";

function Dashboard() {

    const { usuario } = useAuth();

    const esMovil = useIsMobile();

    const [sesiones, setSesiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);
    const [estadoAbiertoId, setEstadoAbiertoId] = useState(null);

    const [horaActual, setHoraActual] = useState(new Date());

    const [sesionObservaciones, setSesionObservaciones] = useState(null);
    const [textoObservaciones, setTextoObservaciones] = useState("");
    const [nuevoEstadoModal, setNuevoEstadoModal] = useState("");
    const [errorObs, setErrorObs] = useState("");
    const [guardando, setGuardando] = useState(false);

    const navigate = useNavigate();


    useEffect(() => {

        cargarDashboard();

    }, []);


    useEffect(() => {

        const intervalo = setInterval(
            () => setHoraActual(new Date()),
            1000
        );

        return () => clearInterval(intervalo);

    }, []);


    useEffect(() => {

        const intervalo = setInterval(
            () => cargarDashboard(true),
            60000
        );

        return () => clearInterval(intervalo);

    }, []);


    useEffect(() => {

        const cerrarMenu = () => {
            setMenuAbiertoId(null);
            setEstadoAbiertoId(null);
        };

        document.addEventListener("click", cerrarMenu);

        return () => document.removeEventListener(
            "click",
            cerrarMenu
        );

    }, []);


    const cargarDashboard = async (silencioso = false) => {

        try {

            if (!silencioso) {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/sesiones/hoy");

            setSesiones(response.data);

        } catch (error) {

            console.error("Error al cargar dashboard:", error);

            setError(
                "No se pudieron cargar las clases de hoy."
            );

        } finally {

            if (!silencioso) {
                setLoading(false);
            }

        }

    };


    /*
     * Cambiar estado de una sesión (edición en línea)
     */

    const cambiarEstado = async (sesion, nuevoEstado) => {

        const estadoActual =
            sesion.asistencia_estado || "PENDIENTE";

        if (nuevoEstado === estadoActual) {
            return;
        }

        try {

            setError("");

            if (nuevoEstado === "PENDIENTE") {

                if (sesion.asistencia_id) {

                    await api.delete(
                        `/asistencias/${sesion.asistencia_id}`
                    );
                }

            } else if (sesion.asistencia_id) {

                await api.put(
                    `/asistencias/${sesion.asistencia_id}`,
                    {
                        estado: nuevoEstado,
                        observaciones:
                            sesion.asistencia_observaciones
                    }
                );

            } else {

                await api.post("/asistencias", {
                    sesion_clase_id: sesion.id,
                    usuario_id: usuario?.id,
                    estado: nuevoEstado
                });
            }

            await cargarDashboard();

        } catch (error) {

            console.error(
                "Error al cambiar estado:",
                error
            );

            setError(
                error.response?.data?.mensaje ||
                "No se pudo actualizar el estado."
            );

            await cargarDashboard();
        }
    };


    /*
     * Modal de observaciones
     */

    const abrirObservaciones = (sesion) => {

        setSesionObservaciones(sesion);
        setTextoObservaciones(
            sesion.asistencia_observaciones || ""
        );
        setNuevoEstadoModal("");
        setErrorObs("");

    };


    const cerrarObservaciones = () => {

        setSesionObservaciones(null);
        setTextoObservaciones("");
        setNuevoEstadoModal("");
        setErrorObs("");

    };


    const guardarObservaciones = async () => {

        if (!sesionObservaciones) {
            return;
        }

        try {

            setGuardando(true);
            setErrorObs("");

            if (sesionObservaciones.asistencia_id) {

                await api.put(
                    `/asistencias/${sesionObservaciones.asistencia_id}`,
                    {
                        estado:
                            sesionObservaciones.asistencia_estado,
                        observaciones:
                            textoObservaciones.trim()
                    }
                );

            } else {

                if (!nuevoEstadoModal) {

                    setErrorObs(
                        "Selecciona un estado para guardar las observaciones."
                    );

                    setGuardando(false);

                    return;
                }

                await api.post("/asistencias", {
                    sesion_clase_id: sesionObservaciones.id,
                    usuario_id: usuario?.id,
                    estado: nuevoEstadoModal,
                    observaciones:
                        textoObservaciones.trim()
                });
            }

            cerrarObservaciones();

            await cargarDashboard();

        } catch (error) {

            console.error(
                "Error al guardar observaciones:",
                error
            );

            setErrorObs(
                error.response?.data?.mensaje ||
                "No se pudieron guardar las observaciones."
            );

        } finally {

            setGuardando(false);
        }
    };


    /*
     * Estadísticas
     */

    const totalClases = sesiones.length;

    const clasesRegistradas = sesiones.filter(
        sesion => sesion.asistencia_estado
    ).length;

    const clasesPendientes = sesiones.filter(
        sesion => !sesion.asistencia_estado
    ).length;

    const incidencias = sesiones.filter(
        sesion =>
            sesion.asistencia_estado === "AUSENTE" ||
            sesion.asistencia_estado === "RETARDO"
    ).length;


    /*
     * Formatear hora
     */

    const formatearHora = (hora) => {

        if (!hora) return "";

        return hora.substring(0, 5);

    };


    /*
     * Estado de tiempo de una sesión (tiempo real)
     */

    const parsearMinutos = (hora) => {

        if (!hora) return 0;

        const [horas, minutos] =
            hora.split(":").map(Number);

        return horas * 60 + minutos;

    };


    const obtenerEstadoTiempo = (sesion) => {

        const minutosActuales =
            horaActual.getHours() * 60 +
            horaActual.getMinutes();

        const minutosInicio =
            parsearMinutos(
                formatearHora(sesion.hora_inicio)
            );

        const minutosFin =
            parsearMinutos(
                formatearHora(sesion.hora_fin)
            );

        if (minutosActuales < minutosInicio) {
            return "POR_COMENZAR";
        }

        if (minutosActuales > minutosFin) {
            return "TERMINADA";
        }

        return "EN_CURSO";

    };


    const infoEstadoTiempo = {
        EN_CURSO: {
            clase: "en-curso",
            texto: "En curso"
        },
        POR_COMENZAR: {
            clase: "por-comenzar",
            texto: "Por comenzar"
        },
        TERMINADA: {
            clase: "terminada",
            texto: "Terminada"
        }
    };


    const prioridadEstadoTiempo = {
        EN_CURSO: 0,
        POR_COMENZAR: 1,
        TERMINADA: 2
    };


    const sesionesOrdenadas = [...sesiones].sort((a, b) => {

        return (
            prioridadEstadoTiempo[
                obtenerEstadoTiempo(a)
            ] -
            prioridadEstadoTiempo[
                obtenerEstadoTiempo(b)
            ]
        );

    });


    /*
     * Formatear fecha
     */

    const formatearFecha = () => {

        return horaActual.toLocaleDateString(
            "es-MX",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    };


    /*
     * Estado visual
     */

    const obtenerClaseEstado = (estado) => {

        if (estado === "PRESENTE") {
            return "estado presente";
        }

        if (estado === "AUSENTE") {
            return "estado ausente";
        }

        if (estado === "RETARDO") {
            return "estado retardo";
        }

        return "estado pendiente";

    };


    const obtenerTextoEstado = (estado) => {

        if (!estado) {
            return "PENDIENTE";
        }

        return estado;

    };


    return (

        <Layout titulo="Dashboard">

            {/* =========================
                ESTADÍSTICAS
            ========================== */}

                    <section className="stats-grid">


                        <div className="stat-card">

                            <div>

                                <span className="stat-title">
                                    Clases de hoy
                                </span>

                                <strong>
                                    {totalClases}
                                </strong>

                            </div>

                            <span className="stat-icon blue">
                                <CalendarCheck size={18} />
                            </span>

                        </div>


                        <div className="stat-card">

                            <div>

                                <span className="stat-title">
                                    Clases registradas
                                </span>

                                <strong>
                                    {clasesRegistradas}
                                </strong>

                            </div>

                            <span className="stat-icon green">
                                <CheckCircle2 size={18} />
                            </span>

                        </div>


                        <div className="stat-card">

                            <div>

                                <span className="stat-title">
                                    Clases pendientes
                                </span>

                                <strong>
                                    {clasesPendientes}
                                </strong>

                            </div>

                            <span className="stat-icon orange">
                                <Clock size={18} />
                            </span>

                        </div>


                        <div className="stat-card">

                            <div>

                                <span className="stat-title">
                                    Clases con incidencias
                                </span>

                                <strong>
                                    {incidencias}
                                </strong>

                            </div>

                            <span className="stat-icon red">
                                <AlertTriangle size={18} />
                            </span>

                        </div>

                    </section>


                    {/* =========================
                        CLASES
                    ========================== */}

                    <section className="dashboard-card">

                        <div className="card-header">

                            <div>

                                <h2>
                                    Clases en Tiempo Real
                                </h2>

                                <span>
                                    {formatearFecha()}
                                </span>

                            </div>

                            <strong className="current-time">
                                {horaActual.toLocaleTimeString(
                                    "es-MX",
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    }
                                )}
                            </strong>

                        </div>


                        {error && (

                            <div className="dashboard-error" role="alert">
                                {error}
                            </div>

                        )}


                        {loading ? (

                            <div className="loading">
                                Cargando clases...
                            </div>

                        ) : sesiones.length === 0 ? (

                            <EmptyState
                                icon={CalendarOff}
                                title="No hay clases programadas para hoy"
                            />

                        ) : esMovil ? (

                            <div className="mobile-session-cards">

                                {sesionesOrdenadas.map(sesion => (

                                    <article
                                        className={
                                            `mobile-session-card ${
                                                obtenerEstadoTiempo(
                                                    sesion
                                                ) === "EN_CURSO"
                                                    ? "sesion-en-curso"
                                                    : ""
                                            }`
                                        }
                                        key={sesion.id}
                                    >

                                        <div className="mobile-session-card-head">

                                            <div className="mobile-session-salon">

                                                <span>Salón</span>

                                                <strong>
                                                    {sesion.salon}
                                                </strong>

                                            </div>


                                            <div className="mobile-session-badges">

                                                <span
                                                    className={
                                                        `estado-badge ${
                                                            obtenerClaseEstado(
                                                                sesion.asistencia_estado
                                                            ).replace(
                                                                "estado ",
                                                                ""
                                                            )
                                                        }`
                                                    }
                                                >
                                                    {obtenerTextoEstado(
                                                        sesion.asistencia_estado
                                                    )}
                                                </span>

                                                <span
                                                    className={
                                                        `tiempo-badge ${
                                                            infoEstadoTiempo[
                                                                obtenerEstadoTiempo(
                                                                    sesion
                                                                )
                                                            ].clase
                                                        }`
                                                    }
                                                >
                                                    {
                                                        infoEstadoTiempo[
                                                            obtenerEstadoTiempo(
                                                                sesion
                                                            )
                                                        ].texto
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        <strong className="mobile-session-docente">
                                            {sesion.docente}
                                        </strong>


                                        <span className="mobile-session-materia">
                                            {sesion.materia}
                                        </span>


                                        <div className="mobile-session-meta">

                                            <span>
                                                {formatearHora(
                                                    sesion.hora_inicio
                                                )}
                                                {" - "}
                                                {formatearHora(
                                                    sesion.hora_fin
                                                )}
                                            </span>

                                            <span>
                                                Grupo: {sesion.grupo}
                                            </span>

                                        </div>


                                        <div className="mobile-session-actions">

                                            <div className="mobile-session-action-wrap">

                                                <button
                                                    type="button"
                                                    className="mobile-action-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEstadoAbiertoId(
                                                            estadoAbiertoId ===
                                                            sesion.id
                                                                ? null
                                                                : sesion.id
                                                        );
                                                    }}
                                                    aria-expanded={
                                                        estadoAbiertoId ===
                                                        sesion.id
                                                    }
                                                    aria-label={`Cambiar estado de ${sesion.docente}`}
                                                >
                                                    <RefreshCw size={18} aria-hidden="true" />
                                                    Estado
                                                </button>


                                                {estadoAbiertoId ===
                                                sesion.id && (

                                                    <div className="mobile-estado-chips">

                                                        {[
                                                            "PRESENTE",
                                                            "AUSENTE",
                                                            "RETARDO",
                                                            "PENDIENTE"
                                                        ].map((estado) => (

                                                            <button
                                                                type="button"
                                                                key={estado}
                                                                className={
                                                                    `mobile-estado-chip ${
                                                                        obtenerClaseEstado(
                                                                            estado
                                                                        ).replace(
                                                                            "estado ",
                                                                            ""
                                                                        )
                                                                    }`
                                                                }
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEstadoAbiertoId(
                                                                        null
                                                                    );
                                                                    cambiarEstado(
                                                                        sesion,
                                                                        estado
                                                                    );
                                                                }}
                                                            >
                                                                {estado}
                                                            </button>

                                                        ))}

                                                    </div>

                                                )}

                                            </div>


                                            <button
                                                type="button"
                                                className="mobile-action-button"
                                                onClick={() =>
                                                    abrirObservaciones(
                                                        sesion
                                                    )
                                                }
                                            >
                                                <NotebookPen size={18} aria-hidden="true" />
                                                Observaciones
                                            </button>

                                        </div>

                                    </article>

                                ))}

                            </div>

                        ) : (

                            <div className="table-container">

                                <table>

                                    <thead>

                                        <tr>

                                            <th scope="col">
                                                Salón
                                            </th>

                                            <th scope="col">
                                                Profesor
                                            </th>

                                            <th scope="col">
                                                Materia
                                            </th>

                                            <th scope="col">
                                                Horario
                                            </th>

                                            <th scope="col">
                                                Grupo
                                            </th>

                                            <th scope="col">
                                                Estado
                                            </th>

                                            <th scope="col">
                                                Acción
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {sesionesOrdenadas.map(sesion => (

                                            <tr
                                                key={sesion.id}
                                                className={
                                                    obtenerEstadoTiempo(
                                                        sesion
                                                    ) === "EN_CURSO"
                                                        ? "sesion-en-curso"
                                                        : ""
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {sesion.salon}
                                                    </strong>
                                                </td>


                                                <td>
                                                    {sesion.docente}
                                                </td>


                                                <td>
                                                    {sesion.materia}
                                                </td>


                                                <td>

                                                    {formatearHora(
                                                        sesion.hora_inicio
                                                    )}

                                                    {" - "}

                                                    {formatearHora(
                                                        sesion.hora_fin
                                                    )}

                                                    <span
                                                        className={
                                                            `tiempo-badge ${
                                                                infoEstadoTiempo[
                                                                    obtenerEstadoTiempo(
                                                                        sesion
                                                                    )
                                                                ].clase
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            infoEstadoTiempo[
                                                                obtenerEstadoTiempo(
                                                                    sesion
                                                                )
                                                            ].texto
                                                        }
                                                    </span>

                                                </td>


                                                <td>
                                                    {sesion.grupo}
                                                </td>


                                                <td>

                                                    <select
                                                        className={
                                                            `estado-select ${
                                                                obtenerClaseEstado(
                                                                    sesion.asistencia_estado
                                                                ).replace(
                                                                    "estado ",
                                                                    ""
                                                                )
                                                            }`
                                                        }
                                                        value={
                                                            sesion.asistencia_estado
                                                            || "PENDIENTE"
                                                        }
                                                        onChange={(e) =>
                                                            cambiarEstado(
                                                                sesion,
                                                                e.target.value
                                                            )
                                                        }
                                                        aria-label={`Cambiar estado de ${sesion.docente}`}
                                                    >

                                                        <option value="PRESENTE">
                                                            PRESENTE
                                                        </option>

                                                        <option value="AUSENTE">
                                                            AUSENTE
                                                        </option>

                                                        <option value="RETARDO">
                                                            RETARDO
                                                        </option>

                                                        <option value="PENDIENTE">
                                                            PENDIENTE
                                                        </option>

                                                    </select>

                                                </td>


                                                <td>

                                                    <div className="action-cell">

                                                        <button
                                                            className="action-button"
                                                            aria-label="Opciones"
                                                            onClick={(e) => {

                                                                e.stopPropagation();

                                                                setMenuAbiertoId(
                                                                    menuAbiertoId ===
                                                                        sesion.id
                                                                        ? null
                                                                        : sesion.id
                                                                );
                                                            }}
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>


                                                        {menuAbiertoId ===
                                                        sesion.id && (

                                                            <div className="action-menu">

                                                                <button
                                                                    className="action-menu-item"
                                                                    onClick={(e) => {

                                                                        e.stopPropagation();

                                                                        setMenuAbiertoId(
                                                                            null
                                                                        );

                                                                        abrirObservaciones(
                                                                            sesion
                                                                        );
                                                                    }}
                                                                >
                                                                    <NotebookPen size={15} />
                                                                    Agregar Observaciones
                                                                </button>

                                                            </div>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>


                    {/* =========================
                        INCIDENCIAS
                    ========================== */}

                    <section className="dashboard-card incidents-card">

                        <div className="card-header">

                            <div>

                                <h2>
                                    Incidencias
                                </h2>

                                <span>
                                    Ausencias y retardos registrados
                                </span>

                            </div>

                        </div>


                        <div className="incidents-list">


                            {sesiones.filter(
                                sesion =>
                                    sesion.asistencia_estado === "AUSENTE" ||
                                    sesion.asistencia_estado === "RETARDO"
                            ).length === 0 ? (

                                <div className="no-incidents">

                                    <CheckCircle2 size={22} />

                                    <p>
                                        No hay incidencias registradas.
                                    </p>

                                </div>

                            ) : (

                                sesiones
                                    .filter(
                                        sesion =>
                                            sesion.asistencia_estado === "AUSENTE" ||
                                            sesion.asistencia_estado === "RETARDO"
                                    )
                                    .map(sesion => (

                                        <div
                                            className="incident-item"
                                            key={sesion.id}
                                        >

                                            <div
                                                className={
                                                    sesion.asistencia_estado ===
                                                    "RETARDO"
                                                        ? "incident-icon warning"
                                                        : "incident-icon danger"
                                                }
                                            >
                                                {sesion.asistencia_estado ===
                                                "RETARDO"
                                                    ? <Clock size={14} />
                                                    : <AlertCircle size={14} />
                                                }
                                            </div>


                                            <div className="incident-info">

                                                <strong>
                                                    {sesion.docente}
                                                </strong>

                                                <span>
                                                    {sesion.asistencia_estado}
                                                </span>

                                                <small>
                                                    {sesion.materia}
                                                    {" · Salón "}
                                                    {sesion.salon}
                                                </small>

                                                {sesion.asistencia_observaciones && (
                                                    <small className="incident-obs">
                                                        {sesion.asistencia_observaciones}
                                                    </small>
                                                )}

                                            </div>

                                        </div>

                                    ))

                            )}

                        </div>


                        {usuario?.rol === "ADMINISTRADOR" && (

                            <button
                                className="view-reports-button"
                                onClick={() => navigate("/reportes")}
                            >
                                Ver historial de incidencias
                            </button>

                        )}

                    </section>


            {sesionObservaciones && (
                <div
                    className="modal-overlay"
                    onClick={cerrarObservaciones}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Agregar Observaciones</h3>
                            <button
                                className="modal-close"
                                onClick={cerrarObservaciones}
                                aria-label="Cerrar"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <strong>Docente:</strong>
                                <span>
                                    {sesionObservaciones.docente}
                                </span>
                            </div>
                            <div className="detail-row">
                                <strong>Materia:</strong>
                                <span>
                                    {sesionObservaciones.materia}
                                </span>
                            </div>
                            <div className="detail-row">
                                <strong>Horario:</strong>
                                <span>
                                    {formatearHora(
                                        sesionObservaciones.hora_inicio
                                    )}
                                    {" - "}
                                    {formatearHora(
                                        sesionObservaciones.hora_fin
                                    )}
                                </span>
                            </div>
                            <div className="detail-row">
                                <strong>Salón:</strong>
                                <span>
                                    {sesionObservaciones.salon}
                                </span>
                            </div>
                            <div className="detail-row">
                                <strong>Estado:</strong>
                                <span>
                                    {obtenerTextoEstado(
                                        sesionObservaciones.asistencia_estado
                                    )}
                                </span>
                            </div>

                            {!sesionObservaciones.asistencia_id && (
                                <div className="obs-field">
                                    <label htmlFor="obs-estado">
                                        Estado
                                    </label>
                                    <select
                                        id="obs-estado"
                                        className="obs-select"
                                        value={nuevoEstadoModal}
                                        onChange={(e) =>
                                            setNuevoEstadoModal(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Selecciona un estado...
                                        </option>
                                        <option value="PRESENTE">
                                            PRESENTE
                                        </option>
                                        <option value="AUSENTE">
                                            AUSENTE
                                        </option>
                                        <option value="RETARDO">
                                            RETARDO
                                        </option>
                                    </select>
                                </div>
                            )}

                            <div className="obs-field">
                                <label htmlFor="obs-observaciones">
                                    Observaciones
                                </label>
                                <textarea
                                    id="obs-observaciones"
                                    className="obs-textarea"
                                    value={textoObservaciones}
                                    onChange={(e) =>
                                        setTextoObservaciones(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Escribe las observaciones..."
                                    rows={4}
                                />
                            </div>

                            {errorObs && (
                                <div className="obs-error" role="alert">
                                    {errorObs}
                                </div>
                            )}

                            <div className="obs-actions">
                                <button
                                    className="obs-cancel"
                                    onClick={cerrarObservaciones}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="obs-save"
                                    onClick={guardarObservaciones}
                                    disabled={guardando}
                                >
                                    {guardando
                                        ? "Guardando..."
                                        : "Guardar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </Layout>

    );

}

export default Dashboard;