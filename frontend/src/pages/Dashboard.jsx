import { useEffect, useState } from "react";
import api from "../services/api";
import logo from "../assets/logo.jpg";
import "../styles/dashboard.css";

function Dashboard() {

    const [sesiones, setSesiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        cargarDashboard();

    }, []);


    const cargarDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/sesiones/hoy");

            setSesiones(response.data);

        } catch (error) {

            console.error("Error al cargar dashboard:", error);

            setError(
                "No se pudieron cargar las clases de hoy."
            );

        } finally {

            setLoading(false);

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
     * Formatear fecha
     */

    const formatearFecha = () => {

        return new Date().toLocaleDateString(
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

        <div className="dashboard-layout">


            {/* =========================
                SIDEBAR
            ========================== */}

            <aside className="sidebar">

                <div className="sidebar-brand">

                    <img
                        src={logo}
                        alt="Tecnológico Nacional de México"
                    />

                    <div>

                        <strong>
                            DSC Control
                        </strong>

                        <span>
                            de Asistencias
                        </span>

                    </div>

                </div>


                <div className="user-profile">

                    <div className="user-avatar">
                        A
                    </div>

                    <div>

                        <strong>
                            Administrador
                        </strong>

                        <span>
                            Administrador
                        </span>

                    </div>

                </div>


                <nav className="sidebar-menu">

                    <button className="menu-item active">
                        <span>▦</span>
                        Dashboard
                    </button>


                    <button className="menu-item">
                        <span>♙</span>
                        Docentes
                    </button>


                    <button className="menu-item">
                        <span>▤</span>
                        Materias
                    </button>


                    <button className="menu-item">
                        <span>▥</span>
                        Reportes
                    </button>


                    <button className="menu-item">
                        <span>▣</span>
                        Horarios
                    </button>


                    <button className="menu-item">
                        <span>⚙</span>
                        Administración y Configuración
                    </button>

                </nav>


                <div className="sidebar-version">
                    v1.0
                </div>

            </aside>


            {/* =========================
                CONTENIDO
            ========================== */}

            <main className="dashboard-main">


                {/* HEADER */}

                <header className="dashboard-header">

                    <h1>
                        Dashboard
                    </h1>


                    <div className="header-user">

                        <div className="header-avatar">
                            A
                        </div>

                        <span>
                            Administrador
                        </span>

                    </div>

                </header>


                <div className="dashboard-content">


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
                                ▣
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
                                ✓
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
                                ◷
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
                                ⚠
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
                                {new Date().toLocaleTimeString(
                                    "es-MX",
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    }
                                )}
                            </strong>

                        </div>


                        {error && (

                            <div className="dashboard-error">
                                {error}
                            </div>

                        )}


                        {loading ? (

                            <div className="loading">
                                Cargando clases...
                            </div>

                        ) : sesiones.length === 0 ? (

                            <div className="empty-state">

                                <span>
                                    📅
                                </span>

                                <p>
                                    No hay clases programadas para hoy.
                                </p>

                            </div>

                        ) : (

                            <div className="table-container">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                Salón
                                            </th>

                                            <th>
                                                Profesor
                                            </th>

                                            <th>
                                                Materia
                                            </th>

                                            <th>
                                                Horario
                                            </th>

                                            <th>
                                                Grupo
                                            </th>

                                            <th>
                                                Estado
                                            </th>

                                            <th>
                                                Acción
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {sesiones.map(sesion => (

                                            <tr key={sesion.id}>

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

                                                </td>


                                                <td>
                                                    {sesion.grupo}
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            obtenerClaseEstado(
                                                                sesion.asistencia_estado
                                                            )
                                                        }
                                                    >
                                                        {obtenerTextoEstado(
                                                            sesion.asistencia_estado
                                                        )}
                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        className="action-button"
                                                        title="Ver detalles"
                                                    >
                                                        ⋮
                                                    </button>

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


                            <span className="incident-count">
                                {incidencias}
                            </span>

                        </div>


                        <div className="incidents-list">


                            {sesiones.filter(
                                sesion =>
                                    sesion.asistencia_estado === "AUSENTE" ||
                                    sesion.asistencia_estado === "RETARDO"
                            ).length === 0 ? (

                                <div className="no-incidents">

                                    <span>
                                        ✓
                                    </span>

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
                                                    ? "◷"
                                                    : "!"
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

                                            </div>

                                        </div>

                                    ))

                            )}

                        </div>


                        <button className="view-reports-button">
                            Ver historial de incidencias
                        </button>

                    </section>


                </div>

            </main>

        </div>

    );

}

export default Dashboard;