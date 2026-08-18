import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import "../styles/monitor.css";

function Monitor() {
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const dias = [
        { id: 1, nombre: "Lunes" },
        { id: 2, nombre: "Martes" },
        { id: 3, nombre: "Miércoles" },
        { id: 4, nombre: "Jueves" },
        { id: 5, nombre: "Viernes" }
    ];

    useEffect(() => {
        const cargarHorarios = async () => {
            try {
                const response = await api.get("/asignaciones");
                setHorarios(response.data || []);
            } catch (err) {
                console.error(err);
                setError("No se pudo cargar el calendario.");
            } finally {
                setLoading(false);
            }
        };

        cargarHorarios();
    }, []);

    const obtenerHorariosDia = (dia) => horarios
        .filter((horario) => Number(horario.dia_semana) === dia)
        .sort((a, b) => String(a.hora_inicio).localeCompare(String(b.hora_inicio)));

    const formatearHora = (hora) => hora ? hora.substring(0, 5) : "";

    return (
        <Layout titulo="Calendario">
            <main className="monitor-page">
                <section className="monitor-shell calendar-monitor-shell">
                <header className="monitor-header">
                    <div>
                        <span className="monitor-kicker">Calendario</span>
                        <h1>Calendario semanal</h1>
                        <p className="monitor-subtitle">
                            Visualización de las clases programadas.
                        </p>
                    </div>
                </header>

                {error && <div className="monitor-error">{error}</div>}

                {loading ? (
                    <div className="monitor-loading">Cargando calendario...</div>
                ) : (
                    <div className="monitor-calendar-container">
                        {dias.map((dia) => {
                            const clasesDelDia = obtenerHorariosDia(dia.id);

                            return (
                                <div className="monitor-calendar-day" key={dia.id}>
                                    <div className="monitor-calendar-day-title">
                                        {dia.nombre}
                                    </div>

                                    <div className="monitor-calendar-day-content">
                                        {clasesDelDia.length === 0 ? (
                                            <span className="monitor-no-class">
                                                Sin clases
                                            </span>
                                        ) : (
                                            clasesDelDia.map((horario) => (
                                                <article
                                                    className="monitor-class-block"
                                                    key={horario.id}
                                                >
                                                    <strong className="monitor-class-time">
                                                        {formatearHora(horario.hora_inicio)} - {formatearHora(horario.hora_fin)}
                                                    </strong>
                                                    <h2>{horario.materia || "Materia"}</h2>
                                                    <span>{horario.docente || "Docente"}</span>
                                                    <span>Grupo: {horario.grupo || "—"}</span>
                                                    <span>Salón: {horario.salon || "—"}</span>
                                                </article>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                </section>
            </main>
        </Layout>
    );
}

export default Monitor;
