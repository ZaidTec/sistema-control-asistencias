import { useEffect, useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";
import api from "../services/api";
import Layout from "../components/Layout";
import useIsMobile from "../hooks/useIsMobile";
import "../styles/monitor.css";


const DIAS = [
    { id: 1, nombre: "Lunes" },
    { id: 2, nombre: "Martes" },
    { id: 3, nombre: "Miércoles" },
    { id: 4, nombre: "Jueves" },
    { id: 5, nombre: "Viernes" }
];


const obtenerNombreDia = (numero) => {

    const dia = DIAS.find(
        (item) => item.id === Number(numero)
    );

    return dia ? dia.nombre : "";

};


const agruparPorHora = (lista) => {

    const porHora = lista.reduce((acumulador, horario) => {

        const hora =
            horario.hora_inicio
                ? String(horario.hora_inicio).substring(0, 5)
                : "00:00";

        if (!acumulador[hora]) {
            acumulador[hora] = [];
        }

        acumulador[hora].push(horario);

        return acumulador;

    }, {});

    return Object.entries(porHora)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([hora, lista]) => ({ hora, lista }));

};


function Monitor() {

    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [vistaAgenda, setVistaAgenda] = useState("hoy");

    const esMovil = useIsMobile();

    const diaActual = (() => {
        const dia = new Date().getDay();
        return dia === 0 ? 7 : dia;
    })();

    useEffect(() => {
        const cargarHorarios = async () => {
            try {
                const response = await api.get("/asignaciones");
                setHorarios(response.data || []);
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar los horarios.");
            } finally {
                setLoading(false);
            }
        };

        cargarHorarios();
    }, []);

    const formatearHora = (hora) => (hora ? String(hora).substring(0, 5) : "");

    const formatearHoraAmPm = (hora) => {
        if (!hora) return "";
        const [hh, mm] = String(hora).split(":");
        let h = Number(hh) || 0;
        const sufijo = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `${String(h).padStart(2, "0")}:${mm} ${sufijo}`;
    };

    const coinciden = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();

        if (!termino) {
            return horarios;
        }

        return horarios.filter(
            (horario) =>
                String(horario.docente || "")
                    .toLowerCase()
                    .includes(termino) ||
                String(horario.materia || "")
                    .toLowerCase()
                    .includes(termino)
        );
    }, [horarios, busqueda]);

    const agenda = useMemo(() => {
        const clasesDeHoy = coinciden.filter(
            (horario) => Number(horario.dia_semana) === diaActual
        );

        return agruparPorHora(clasesDeHoy);
    }, [coinciden, diaActual]);

    const semana = useMemo(() => {
        const porDia = coinciden.reduce((acumulador, horario) => {
            const dia = Number(horario.dia_semana);
            if (!acumulador[dia]) acumulador[dia] = [];
            acumulador[dia].push(horario);
            return acumulador;
        }, {});

        return Object.entries(porDia)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([dia, lista]) => ({
                dia: Number(dia),
                diaNombre: obtenerNombreDia(dia),
                horas: agruparPorHora(lista)
            }));
    }, [coinciden]);

    const grupos = useMemo(() => {
        const agrupado = coinciden.reduce((grupos, horario) => {
            const nombre = horario.docente || "Sin docente";
            if (!grupos[nombre]) grupos[nombre] = [];
            grupos[nombre].push(horario);
            return grupos;
        }, {});

        return Object.entries(agrupado)
            .sort(([a], [b]) => a.localeCompare(b, "es"))
            .map(([docente, lista]) => ({
                docente,
                lista: [...lista].sort(
                    (a, b) =>
                        Number(a.dia_semana) - Number(b.dia_semana) ||
                        String(a.hora_inicio).localeCompare(String(b.hora_inicio))
                )
            }));
    }, [coinciden]);

    const clasesHoy = horarios.filter(
        (horario) => Number(horario.dia_semana) === diaActual
    ).length;

    const etiquetaHoy =
        diaActual <= 5 ? obtenerNombreDia(diaActual) : "fin de semana";

    const renderTarjetaClase = (clase) => (
        <article
            className="monitor-agenda-class"
            key={clase.id}
            style={{
                "--clase-color":
                    clase.color ||
                    "#1558c7"
            }}
        >
            <div className="monitor-agenda-class-info">
                <strong>
                    {clase.materia || "Materia"}
                </strong>
                <span>
                    {clase.docente || "Docente"}
                </span>
                <small>
                    Salón {clase.salon || "—"}
                    {" · "}Grupo {clase.grupo || "—"}
                </small>
            </div>

            <span className="monitor-agenda-class-time">
                {formatearHora(
                    clase.hora_inicio
                )}
                {" - "}
                {formatearHora(
                    clase.hora_fin
                )}
            </span>
        </article>
    );

    return (
        <Layout titulo="Horarios">
            <div className="monitor-page">
                <section className="monitor-shell monitor-docentes-shell">
                    <header className="monitor-header">
                        <div>
                            <span className="monitor-kicker">Docentes</span>
                            <h2>
                                {esMovil
                                    ? vistaAgenda === "hoy"
                                        ? "Horarios de hoy"
                                        : "Horarios de la semana"
                                    : "Horarios de docentes"}
                            </h2>
                            <p className="monitor-subtitle">
                                {esMovil
                                    ? vistaAgenda === "hoy"
                                        ? "Agenda de las clases del día, ordenadas por hora."
                                        : "Clases de la semana, agrupadas por día."
                                    : "Clases asignadas agrupadas por docente."}
                            </p>
                            <span className="monitor-today">
                                Hoy es {etiquetaHoy} · {clasesHoy}{" "}
                                {clasesHoy === 1 ? "clase" : "clases"}
                            </span>
                        </div>
                    </header>

                    <div className="monitor-search">
                        <Search size={16} className="monitor-search-icon" aria-hidden="true" />
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por docente o materia..."
                            aria-label="Buscar por docente o materia"
                        />
                    </div>

                    {error && (
                        <div className="monitor-error" role="alert">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="monitor-loading">Cargando horarios...</div>
                    ) : esMovil ? (
                        <>
                            <div
                                className="monitor-view-toggle"
                                role="tablist"
                                aria-label="Ver horarios"
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={vistaAgenda === "hoy"}
                                    className={
                                        vistaAgenda === "hoy"
                                            ? "monitor-view-toggle-btn monitor-view-toggle-active"
                                            : "monitor-view-toggle-btn"
                                    }
                                    onClick={() => setVistaAgenda("hoy")}
                                >
                                    Hoy
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={vistaAgenda === "semana"}
                                    className={
                                        vistaAgenda === "semana"
                                            ? "monitor-view-toggle-btn monitor-view-toggle-active"
                                            : "monitor-view-toggle-btn"
                                    }
                                    onClick={() => setVistaAgenda("semana")}
                                >
                                    Semana
                                </button>
                            </div>

                            {vistaAgenda === "hoy" ? (
                                agenda.length === 0 ? (
                                    <div className="monitor-empty" role="status">
                                        {coinciden.length === 0
                                            ? "No hay horarios que coincidan con la búsqueda."
                                            : "No hay clases para hoy."}
                                    </div>
                                ) : (
                                    <div className="monitor-agenda">
                                        {agenda.map(({ hora, lista }) => (
                                            <section
                                                className="monitor-agenda-hour"
                                                key={hora}
                                            >
                                                <h3 className="monitor-agenda-hour-title">
                                                    {formatearHoraAmPm(hora)}
                                                </h3>

                                                <div className="monitor-agenda-classes">
                                                    {lista.map(renderTarjetaClase)}
                                                </div>
                                            </section>
                                        ))}
                                    </div>
                                )
                            ) : semana.length === 0 ? (
                                <div className="monitor-empty" role="status">
                                    {coinciden.length === 0
                                        ? "No hay horarios que coincidan con la búsqueda."
                                        : "No hay clases programadas."}
                                </div>
                            ) : (
                                <div className="monitor-agenda">
                                    {semana.map(({ dia, diaNombre, horas }) => (
                                        <section
                                            className="monitor-agenda-dia"
                                            key={dia}
                                        >
                                            <h3 className="monitor-agenda-dia-title">
                                                {diaNombre}
                                            </h3>

                                            {horas.map(({ hora, lista }) => (
                                                <div
                                                    className="monitor-agenda-hour-block"
                                                    key={hora}
                                                >
                                                    <h4 className="monitor-agenda-hour-title">
                                                        {formatearHoraAmPm(hora)}
                                                    </h4>

                                                    <div className="monitor-agenda-classes">
                                                        {lista.map(renderTarjetaClase)}
                                                    </div>
                                                </div>
                                            ))}
                                        </section>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : grupos.length === 0 ? (
                        <div className="monitor-empty" role="status">
                            {coinciden.length === 0
                                ? "No hay horarios registrados."
                                : "No se encontraron resultados para esa búsqueda."}
                        </div>
                    ) : (
                        <div className="monitor-groups">
                            {grupos.map(({ docente, lista }) => (
                                <article className="monitor-group" key={docente}>
                                    <header className="monitor-group-header">
                                        <strong>
                                            <UserRound size={14} aria-hidden="true" />
                                            {docente}
                                        </strong>
                                        <span>
                                            {lista.length}{" "}
                                            {lista.length === 1 ? "clase" : "clases"}
                                        </span>
                                    </header>

                                    <table className="monitor-group-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Materia</th>
                                                <th scope="col">Grupo</th>
                                                <th scope="col">Salón</th>
                                                <th scope="col">Día</th>
                                                <th scope="col">Horario</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lista.map((horario) => {
                                                const esHoy =
                                                    Number(horario.dia_semana) === diaActual;

                                                return (
                                                    <tr
                                                        key={horario.id}
                                                        className={esHoy ? "monitor-row-hoy" : ""}
                                                    >
                                                        <td>
                                                            <span
                                                                className="monitor-class-dot"
                                                                style={{
                                                                    background:
                                                                        horario.color ||
                                                                        "#1558c7"
                                                                }}
                                                                aria-hidden="true"
                                                            />
                                                            {horario.materia || "—"}
                                                        </td>
                                                        <td>{horario.grupo || "—"}</td>
                                                        <td>{horario.salon || "—"}</td>
                                                        <td>
                                                            {obtenerNombreDia(horario.dia_semana)}
                                                            {esHoy && (
                                                                <span className="monitor-hoy-badge">
                                                                    Hoy
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {formatearHora(horario.hora_inicio)}
                                                            {" - "}
                                                            {formatearHora(horario.hora_fin)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}

export default Monitor;