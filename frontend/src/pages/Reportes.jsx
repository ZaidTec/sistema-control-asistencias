import { useEffect, useState } from "react";
import {
    Printer,
    Search,
    ClipboardList,
    CheckCircle2,
    XCircle,
    Clock,
    Minus,
    BarChart3
} from "lucide-react";
import api from "../services/api";
import Layout from "../components/Layout";
import EmptyState from "../components/ui/EmptyState";
import "../styles/reportes.css";

function Reportes() {

    const [periodos, setPeriodos] = useState([]);
    const [docentes, setDocentes] = useState([]);

    const [resultados, setResultados] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [filtros, setFiltros] = useState({
        periodo_id: "",
        docente_id: "",
        fecha_inicio: "",
        fecha_fin: "",
        estado: ""
    });


    /* =========================================
       CARGAR PERIODOS Y DOCENTES
    ========================================= */

    useEffect(() => {
        cargarCatalogos();
    }, []);


    const cargarCatalogos = async () => {

        try {

            setError("");

            const [periodosResponse, docentesResponse] =
                await Promise.all([
                    api.get("/periodos"),
                    api.get("/docentes")
                ]);

            setPeriodos(periodosResponse.data);
            setDocentes(docentesResponse.data);

        } catch (error) {

            console.error(
                "Error al cargar catálogos:",
                error
            );

            setError(
                "No se pudieron cargar los periodos o docentes."
            );

        }

    };


    /* =========================================
       CAMBIAR FILTROS
    ========================================= */

    const manejarCambio = (e) => {

        const { name, value } = e.target;

        setFiltros({
            ...filtros,
            [name]: value
        });

    };


    /* =========================================
       BUSCAR REPORTES
    ========================================= */

    const buscarReporte = async () => {

        try {

            setLoading(true);
            setError("");

            const params = {};

            if (filtros.periodo_id) {
                params.periodo_id = filtros.periodo_id;
            }

            if (filtros.docente_id) {
                params.docente_id = filtros.docente_id;
            }

            if (filtros.fecha_inicio) {
                params.fecha_inicio = filtros.fecha_inicio;
            }

            if (filtros.fecha_fin) {
                params.fecha_fin = filtros.fecha_fin;
            }

            if (filtros.estado) {
                params.estado = filtros.estado;
            }


            const response = await api.get(
                "/reportes/asistencias",
                {
                    params
                }
            );


            setResultados(response.data);

        } catch (error) {

            console.error(
                "Error al obtener reporte:",
                error
            );

            setError(
                "No se pudo obtener el reporte."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================================
       LIMPIAR FILTROS
    ========================================= */

    const limpiarFiltros = () => {

        setFiltros({
            periodo_id: "",
            docente_id: "",
            fecha_inicio: "",
            fecha_fin: "",
            estado: ""
        });

        setResultados([]);

        setError("");

    };


    /* =========================================
       IMPRIMIR
    ========================================= */

    const imprimirReporte = () => {

        window.print();

    };


    /* =========================================
       RESUMEN
    ========================================= */

    const total = resultados.length;

    const presentes = resultados.filter(
        (registro) =>
            registro.estado?.toLowerCase() === "presente"
    ).length;

    const ausentes = resultados.filter(
        (registro) =>
            registro.estado?.toLowerCase() === "ausente"
    ).length;

    const retardos = resultados.filter(
        (registro) =>
            registro.estado?.toLowerCase() === "retardo"
    ).length;

    const pendientes = resultados.filter(
        (registro) =>
            registro.estado?.toLowerCase() === "pendiente"
    ).length;


    /* =========================================
       NOMBRE DOCENTE
    ========================================= */

    const obtenerNombreDocente = (docente) => {

        if (!docente) {
            return "";
        }

        return [
            docente.nombre,
            docente.apellido_p,
            docente.apellido_m
        ]
            .filter(Boolean)
            .join(" ");

    };


    return (

        <Layout titulo="Reportes">

            {/* =========================================
                TITULO
            ========================================== */}

                    <section className="page-title">

                        <div>

                            <h2>
                                Reporte de asistencias
                            </h2>

                            <p>
                                Consulta e imprime el historial
                                de asistencias de los docentes.
                            </p>

                        </div>


                        <button
                            className="print-button"
                            onClick={imprimirReporte}
                            disabled={resultados.length === 0}
                        >
                            <Printer size={15} />
                            Imprimir reporte
                        </button>

                    </section>


                    {/* =========================================
                        FILTROS
                    ========================================== */}

                    <section className="filters-card">

                        <div className="filters-title">

                            <div>

                                <h3>
                                    Filtros de búsqueda
                                </h3>

                                <p>
                                    Selecciona los datos que deseas consultar.
                                </p>

                            </div>

                        </div>


                        <div className="filters-grid">


                            {/* PERIODO */}

                            <div className="filter-group">

                                <label htmlFor="reporte-periodo">
                                    Periodo escolar
                                </label>

                                <select
                                    id="reporte-periodo"
                                    name="periodo_id"
                                    value={filtros.periodo_id}
                                    onChange={manejarCambio}
                                >

                                    <option value="">
                                        Todos los periodos
                                    </option>

                                    {periodos.map((periodo) => (

                                        <option
                                            key={periodo.id}
                                            value={periodo.id}
                                        >
                                            {periodo.nombre}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* DOCENTE */}

                            <div className="filter-group">

                                <label htmlFor="reporte-docente">
                                    Docente
                                </label>

                                <select
                                    id="reporte-docente"
                                    name="docente_id"
                                    value={filtros.docente_id}
                                    onChange={manejarCambio}
                                >

                                    <option value="">
                                        Todos los docentes
                                    </option>

                                    {docentes.map((docente) => (

                                        <option
                                            key={docente.id}
                                            value={docente.id}
                                        >
                                            {obtenerNombreDocente(docente)}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* FECHA INICIO */}

                            <div className="filter-group">

                                <label htmlFor="reporte-fecha-inicio">
                                    Fecha inicial
                                </label>

                                <input
                                    id="reporte-fecha-inicio"
                                    type="date"
                                    name="fecha_inicio"
                                    value={filtros.fecha_inicio}
                                    onChange={manejarCambio}
                                />

                            </div>


                            {/* FECHA FINAL */}

                            <div className="filter-group">

                                <label htmlFor="reporte-fecha-fin">
                                    Fecha final
                                </label>

                                <input
                                    id="reporte-fecha-fin"
                                    type="date"
                                    name="fecha_fin"
                                    value={filtros.fecha_fin}
                                    onChange={manejarCambio}
                                />

                            </div>


                            {/* ESTADO */}

                            <div className="filter-group">

                                <label htmlFor="reporte-estado">
                                    Estado
                                </label>

                                <select
                                    id="reporte-estado"
                                    name="estado"
                                    value={filtros.estado}
                                    onChange={manejarCambio}
                                >

                                    <option value="">
                                        Todos
                                    </option>

                                    <option value="Presente">
                                        Presente
                                    </option>

                                    <option value="Ausente">
                                        Ausente
                                    </option>

                                    <option value="Retardo">
                                        Retardo
                                    </option>

                                    <option value="Pendiente">
                                        Pendiente
                                    </option>

                                </select>

                            </div>


                        </div>


                        <div className="filter-actions">

                            <button
                                className="clear-button"
                                onClick={limpiarFiltros}
                            >
                                Limpiar
                            </button>


                            <button
                                className="search-button"
                                onClick={buscarReporte}
                                disabled={loading}
                            >

                                {loading
                                    ? "Buscando..."
                                    : <><Search size={15} /> Buscar</>}

                            </button>

                        </div>

                    </section>


                    {/* ERROR */}

                    {error && (

                        <div className="reportes-error" role="alert">
                            {error}
                        </div>

                    )}


                    {/* =========================================
                        RESUMEN
                    ========================================== */}

                    {resultados.length > 0 && (

                        <section className="summary-grid">

                            <div className="summary-card">

                                <span className="summary-icon total">
                                    <ClipboardList size={16} />
                                </span>

                                <div>

                                    <span>
                                        Total de registros
                                    </span>

                                    <strong>
                                        {total}
                                    </strong>

                                </div>

                            </div>


                            <div className="summary-card">

                                <span className="summary-icon presente">
                                    <CheckCircle2 size={16} />
                                </span>

                                <div>

                                    <span>
                                        Presentes
                                    </span>

                                    <strong>
                                        {presentes}
                                    </strong>

                                </div>

                            </div>


                            <div className="summary-card">

                                <span className="summary-icon ausente">
                                    <XCircle size={16} />
                                </span>

                                <div>

                                    <span>
                                        Ausentes
                                    </span>

                                    <strong>
                                        {ausentes}
                                    </strong>

                                </div>

                            </div>


                            <div className="summary-card">

                                <span className="summary-icon retardo">
                                    <Clock size={16} />
                                </span>

                                <div>

                                    <span>
                                        Retardos
                                    </span>

                                    <strong>
                                        {retardos}
                                    </strong>

                                </div>

                            </div>

                            <div className="summary-card">

                                <span className="summary-icon pendiente">
                                    <Minus size={16} />
                                </span>

                                <div>

                                    <span>
                                        Pendientes
                                    </span>

                                    <strong>
                                        {pendientes}
                                    </strong>

                                </div>

                            </div>

                        </section>

                    )}


                    {/* =========================================
                        TABLA
                    ========================================== */}

                    <section className="reportes-card">


                        <div className="reportes-card-header">

                            <div>

                                <h3>
                                    Historial de asistencias
                                </h3>

                                <p>
                                    Registros de asistencia por clase.
                                </p>

                            </div>


                            {resultados.length > 0 && (

                                <span className="results-count">
                                    {resultados.length} registros
                                </span>

                            )}

                        </div>


                        {loading ? (

                            <div className="reportes-loading">
                                Consultando información...
                            </div>

                        ) : resultados.length === 0 ? (

                            <EmptyState
                                icon={BarChart3}
                                title="No hay resultados"
                                text={'Selecciona los filtros y presiona "Buscar" para consultar las asistencias.'}
                            />

                        ) : (

                            <div className="reportes-table-container">

                                <table className="reportes-table">

                                    <thead>

                                        <tr>

                                            <th scope="col">
                                                Fecha
                                            </th>

                                            <th scope="col">
                                                Docente
                                            </th>

                                            <th scope="col">
                                                Materia
                                            </th>

                                            <th scope="col">
                                                Grupo
                                            </th>

                                            <th scope="col">
                                                Salón
                                            </th>

                                            <th scope="col">
                                                Horario
                                            </th>

                                            <th scope="col">
                                                Estado
                                            </th>

                                            <th scope="col">
                                                Observaciones
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {resultados.map(
                                            (registro, index) => (

                                                <tr key={
                                                    registro.id || index
                                                }>

                                                    <td>
                                                        {registro.fecha}
                                                    </td>

                                                    <td>
                                                        {registro.docente}
                                                    </td>

                                                    <td>
                                                        {registro.materia}
                                                    </td>

                                                    <td>
                                                        {registro.grupo}
                                                    </td>

                                                    <td>
                                                        {registro.salon}
                                                    </td>

                                                    <td>
                                                        {registro.hora_inicio}
                                                        {" - "}
                                                        {registro.hora_fin}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                `estado-badge ${
                                                                    registro.estado
                                                                        ?.toLowerCase()
                                                                }`
                                                            }
                                                        >
                                                            {registro.estado}
                                                        </span>

                                                    </td>

                                                    <td className="observaciones" title={registro.observaciones || ""}>

                                                        {registro.observaciones
                                                            || "—"}

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>

        </Layout>

    );

}

export default Reportes;