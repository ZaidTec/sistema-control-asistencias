import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import "../styles/horarios.css";

function Horarios() {

    const [searchParams] = useSearchParams();

    const [periodos, setPeriodos] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [salones, setSalones] = useState([]);

    const [horarios, setHorarios] = useState([]);

    const [loading, setLoading] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(true);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [mostrarHorarios, setMostrarHorarios] = useState(false);

    const [formulario, setFormulario] = useState({
        periodo_id: "",
        docente_id: "",
        materia_id: "",
        grupo_id: "",
        salon_id: "",
        dia_semana: "",
        hora_inicio: "",
        hora_fin: ""
    });


    const dias = [
        { id: 1, nombre: "Lunes" },
        { id: 2, nombre: "Martes" },
        { id: 3, nombre: "Miércoles" },
        { id: 4, nombre: "Jueves" },
        { id: 5, nombre: "Viernes" }
    ];


    useEffect(() => {

        const docenteId =
            searchParams.get("docente_id");

        if (docenteId) {

            setFormulario((prev) => ({
                ...prev,
                docente_id: docenteId
            }));

        }

    }, [searchParams]);


    /* =========================================
       CARGAR CATÁLOGOS
    ========================================== */

    useEffect(() => {
        cargarDatos();
    }, []);


    const cargarDatos = async () => {

        try {

            setCargandoDatos(true);
            setError("");

            const [
                periodosResponse,
                docentesResponse,
                materiasResponse,
                gruposResponse,
                salonesResponse
            ] = await Promise.all([
                api.get("/periodos"),
                api.get("/docentes"),
                api.get("/materias"),
                api.get("/grupos"),
                api.get("/salones")
            ]);

            setPeriodos(periodosResponse.data);
            setDocentes(docentesResponse.data);
            setMaterias(materiasResponse.data);
            setGrupos(gruposResponse.data);
            setSalones(salonesResponse.data);

        } catch (error) {

            console.error(
                "Error al cargar datos:",
                error
            );

            setError(
                "No se pudieron cargar los catálogos."
            );

        } finally {

            setCargandoDatos(false);

        }

    };


    /* =========================================
       CARGAR HORARIOS
    ========================================== */

    useEffect(() => {

        cargarHorarios();

    }, [formulario.periodo_id]);


    const cargarHorarios = async () => {

        try {

            const params = {};

            if (formulario.periodo_id) {
                params.periodo_id =
                    formulario.periodo_id;
            }

            const response = await api.get(
                "/asignaciones",
                { params }
            );

            setHorarios(response.data);

        } catch (error) {

            console.error(
                "Error al cargar horarios:",
                error
            );

        }

    };


    /* =========================================
       CAMBIAR FORMULARIO
    ========================================== */

    const manejarCambio = (e) => {

        const { name, value } = e.target;

        setFormulario({
            ...formulario,
            [name]: value
        });

        setMensaje("");
        setError("");

    };


    /* =========================================
       REGISTRAR HORARIO
    ========================================== */

    const registrarHorario = async (e) => {

        e.preventDefault();

        setError("");
        setMensaje("");


        if (
            !formulario.periodo_id ||
            !formulario.docente_id ||
            !formulario.materia_id ||
            !formulario.grupo_id ||
            !formulario.salon_id ||
            !formulario.dia_semana ||
            !formulario.hora_inicio ||
            !formulario.hora_fin
        ) {

            setError(
                "Completa todos los campos."
            );

            return;

        }


        if (
            formulario.hora_inicio >=
            formulario.hora_fin
        ) {

            setError(
                "La hora de inicio debe ser menor que la hora de fin."
            );

            return;

        }


        try {

            setLoading(true);

            await api.post(
                "/asignaciones",
                {
                    periodo_id:
                        Number(formulario.periodo_id),

                    docente_id:
                        Number(formulario.docente_id),

                    materia_id:
                        Number(formulario.materia_id),

                    grupo_id:
                        Number(formulario.grupo_id),

                    salon_id:
                        Number(formulario.salon_id),

                    dia_semana:
                        Number(formulario.dia_semana),

                    hora_inicio:
                        formulario.hora_inicio,

                    hora_fin:
                        formulario.hora_fin,

                    activo: true
                }
            );


            setMensaje(
                "Horario registrado correctamente."
            );


            setFormulario({
                ...formulario,

                docente_id: "",
                materia_id: "",
                grupo_id: "",
                salon_id: "",
                dia_semana: "",
                hora_inicio: "",
                hora_fin: ""
            });


            cargarHorarios();

        } catch (error) {

            console.error(
                "Error al registrar horario:",
                error
            );


            if (
                error.response &&
                error.response.status === 409
            ) {

                setError(
                    "No se puede registrar el horario porque existe un conflicto de salón u horario."
                );

            } else {

                setError(
                    error.response?.data?.mensaje ||
                    "No se pudo registrar el horario."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    /* =========================================
       ELIMINAR HORARIO
    ========================================== */

    const eliminarHorario = async (id) => {

        const confirmar = window.confirm(
            "¿Seguro que deseas eliminar este horario?"
        );

        if (!confirmar) {
            return;
        }


        try {

            await api.delete(
                `/asignaciones/${id}`
            );

            setMensaje(
                "Horario eliminado correctamente."
            );

            cargarHorarios();

        } catch (error) {

            console.error(
                "Error al eliminar horario:",
                error
            );

            setError(
                "No se pudo eliminar el horario."
            );

        }

    };


    /* =========================================
       FUNCIONES AUXILIARES
    ========================================== */

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


    const obtenerDia = (numero) => {

        const dia = dias.find(
            item => item.id === Number(numero)
        );

        return dia
            ? dia.nombre
            : "";

    };


    const obtenerHorariosDia = (dia) => {

        return horarios.filter(
            horario =>
                Number(horario.dia_semana) === dia
        );

    };


    const agruparPorDocente = () => {

        return horarios.reduce(
            (grupos, horario) => {

                const nombre =
                    horario.docente ||
                    "Sin docente";

                if (!grupos[nombre]) {
                    grupos[nombre] = [];
                }

                grupos[nombre].push(horario);

                return grupos;

            },
            {}
        );

    };


    return (

        <Layout titulo="Horarios">

            {/* TITULO */}

                    <section className="page-title">

                        <div>

                            <h2>
                                Calendario de horarios
                            </h2>

                            <p>
                                Registra y administra las clases
                                asignadas a los docentes.
                            </p>

                        </div>

                    </section>


                    {/* MENSAJES */}

                    {error && (

                        <div className="horarios-error">
                            {error}
                        </div>

                    )}


                    {mensaje && (

                        <div className="horarios-success">
                            {mensaje}
                        </div>

                    )}


                    <div className="horarios-grid">


                        {/* =====================================
                            FORMULARIO
                        ====================================== */}

                        <section className="horario-form-card">

                            <div className="card-header">

                                <h3>
                                    Registrar horario
                                </h3>

                                <p>
                                    Asigna una clase a un docente.
                                </p>

                            </div>


                            <form
                                onSubmit={registrarHorario}
                                className="horario-form"
                            >


                                {/* PERIODO */}

                                <div className="form-group">

                                    <label>
                                        Periodo escolar
                                    </label>

                                    <select
                                        name="periodo_id"
                                        value={
                                            formulario.periodo_id
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    >

                                        <option value="">
                                            Seleccionar periodo
                                        </option>

                                        {periodos.map(
                                            periodo => (

                                                <option
                                                    key={
                                                        periodo.id
                                                    }
                                                    value={
                                                        periodo.id
                                                    }
                                                >
                                                    {
                                                        periodo.nombre
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* DOCENTE */}

                                <div className="form-group">

                                    <label>
                                        Docente
                                    </label>

                                    <select
                                        name="docente_id"
                                        value={
                                            formulario.docente_id
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    >

                                        <option value="">
                                            Seleccionar docente
                                        </option>

                                        {docentes.map(
                                            docente => (

                                                <option
                                                    key={
                                                        docente.id
                                                    }
                                                    value={
                                                        docente.id
                                                    }
                                                >
                                                    {
                                                        obtenerNombreDocente(
                                                            docente
                                                        )
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* MATERIA */}

                                <div className="form-group">

                                    <label>
                                        Materia
                                    </label>

                                    <select
                                        name="materia_id"
                                        value={
                                            formulario.materia_id
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    >

                                        <option value="">
                                            Seleccionar materia
                                        </option>

                                        {materias.map(
                                            materia => (

                                                <option
                                                    key={
                                                        materia.id
                                                    }
                                                    value={
                                                        materia.id
                                                    }
                                                >
                                                    {
                                                        materia.clave
                                                    }
                                                    {" - "}
                                                    {
                                                        materia.nombre
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* GRUPO */}

                                <div className="form-group">

                                    <label>
                                        Grupo
                                    </label>

                                    <select
                                        name="grupo_id"
                                        value={
                                            formulario.grupo_id
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    >

                                        <option value="">
                                            Seleccionar grupo
                                        </option>

                                        {grupos.map(
                                            grupo => (

                                                <option
                                                    key={
                                                        grupo.id
                                                    }
                                                    value={
                                                        grupo.id
                                                    }
                                                >
                                                    {
                                                        grupo.clave
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* SALON */}

                                <div className="form-group">

                                    <label>
                                        Salón
                                    </label>

                                    <select
                                        name="salon_id"
                                        value={
                                            formulario.salon_id
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    >

                                        <option value="">
                                            Seleccionar salón
                                        </option>

                                        {salones.length > 0
                                            ? salones.map(
                                                salon => (

                                                    <option
                                                        key={
                                                            salon.id
                                                        }
                                                        value={
                                                            salon.id
                                                        }
                                                    >
                                                        Salón{" "}
                                                        {
                                                            salon.numero
                                                        }
                                                    </option>

                                                )
                                            )
                                            : Array.from(
                                                { length: 45 },
                                                (_, i) => (

                                                    <option
                                                        key={
                                                            i + 1
                                                        }
                                                        value={
                                                            i + 1
                                                        }
                                                    >
                                                        Salón{" "}
                                                        {i + 1}
                                                    </option>

                                                )
                                            )
                                        }

                                    </select>

                                </div>


                                {/* DIA */}

                                <div className="form-group">

                                    <label>
                                        Día
                                    </label>

                                    <select
                                        name="dia_semana"
                                        value={
                                            formulario.dia_semana
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    >

                                        <option value="">
                                            Seleccionar día
                                        </option>

                                        {dias.map(
                                            dia => (

                                                <option
                                                    key={
                                                        dia.id
                                                    }
                                                    value={
                                                        dia.id
                                                    }
                                                >
                                                    {
                                                        dia.nombre
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="time-grid">


                                    {/* HORA INICIO */}

                                    <div className="form-group">

                                        <label>
                                            Hora inicio
                                        </label>

                                        <input
                                            type="time"
                                            name="hora_inicio"
                                            value={
                                                formulario.hora_inicio
                                            }
                                            onChange={
                                                manejarCambio
                                            }
                                        />

                                    </div>


                                    {/* HORA FIN */}

                                    <div className="form-group">

                                        <label>
                                            Hora fin
                                        </label>

                                        <input
                                            type="time"
                                            name="hora_fin"
                                            value={
                                                formulario.hora_fin
                                            }
                                            onChange={
                                                manejarCambio
                                            }
                                        />

                                    </div>

                                </div>


                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Guardando..."
                                        : "+ Registrar horario"}

                                </button>

                            </form>

                        </section>


                        {/* =====================================
                            CALENDARIO
                        ====================================== */}

                        <section className="calendar-card">

                            <div className="card-header">

                                <div>

                                    <h3>
                                        Calendario semanal
                                    </h3>

                                    <p>
                                        Visualización de las clases
                                        registradas.
                                    </p>

                                </div>


                                <button
                                    className="view-horarios-button"
                                    onClick={() =>
                                        setMostrarHorarios(true)
                                    }
                                >
                                    📋 Ver horarios
                                </button>

                            </div>


                            <div className="calendar-container">

                                {dias.map(
                                    dia => (

                                        <div
                                            className="calendar-day"
                                            key={dia.id}
                                        >

                                            <div className="calendar-day-title">

                                                {dia.nombre}

                                            </div>


                                            <div className="calendar-day-content">

                                                {obtenerHorariosDia(
                                                    dia.id
                                                ).length === 0 ? (

                                                    <span className="no-class">
                                                        Sin clases
                                                    </span>

                                                ) : (

                                                    obtenerHorariosDia(
                                                        dia.id
                                                    ).map(
                                                        horario => (

                                                            <div
                                                                className="class-block"
                                                                key={
                                                                    horario.id
                                                                }
                                                            >

                                                                <div className="class-time">

                                                                    {
                                                                        horario.hora_inicio
                                                                    }

                                                                    {" - "}

                                                                    {
                                                                        horario.hora_fin
                                                                    }

                                                                </div>


                                                                <strong>

                                                                    {
                                                                        horario.materia ||
                                                                        "Materia"
                                                                    }

                                                                </strong>


                                                                <span>

                                                                    {
                                                                        horario.docente ||
                                                                        "Docente"
                                                                    }

                                                                </span>


                                                                <span>

                                                                    Grupo:{" "}
                                                                    {
                                                                        horario.grupo ||
                                                                        "—"
                                                                    }

                                                                </span>


                                                                <span>

                                                                    Salón:{" "}
                                                                    {
                                                                        horario.salon ||
                                                                        "—"
                                                                    }

                                                                </span>


                                                                <button
                                                                    className="delete-class"
                                                                    onClick={() =>
                                                                        eliminarHorario(
                                                                            horario.id
                                                                        )
                                                                    }
                                                                >
                                                                    Eliminar
                                                                </button>

                                                            </div>

                                                        )
                                                    )

                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </section>

                    </div>


                    {/* =========================================
                        MODAL HORARIOS POR DOCENTE
                    ========================================== */}

                    {mostrarHorarios && (

                        <div
                            className="modal-overlay"
                            onClick={() =>
                                setMostrarHorarios(false)
                            }
                        >

                            <div
                                className="horarios-modal"
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                            >

                                <div className="modal-header">

                                    <div>

                                        <h2>
                                            Horarios registrados
                                        </h2>

                                        <p>
                                            Clases asignadas
                                            agrupadas por docente.
                                        </p>

                                    </div>


                                    <button
                                        className="close-modal"
                                        onClick={() =>
                                            setMostrarHorarios(false)
                                        }
                                    >
                                        ×
                                    </button>

                                </div>


                                <div className="horarios-modal-body">

                                    {Object.keys(
                                        agruparPorDocente()
                                    ).length === 0 ? (

                                        <div className="horarios-empty">
                                            No hay horarios registrados.
                                        </div>

                                    ) : (

                                        Object.entries(
                                            agruparPorDocente()
                                        ).map(
                                            ([docente, lista]) => (

                                                <div
                                                    className="docente-group"
                                                    key={docente}
                                                >

                                                    <div className="docente-group-header">

                                                        <strong>
                                                            👤 {docente}
                                                        </strong>

                                                        <span>
                                                            {lista.length}{" "}
                                                            {lista.length === 1
                                                                ? "clase"
                                                                : "clases"}
                                                        </span>

                                                    </div>


                                                    <table className="docente-group-table">

                                                        <thead>

                                                            <tr>

                                                                <th>
                                                                    Materia
                                                                </th>

                                                                <th>
                                                                    Grupo
                                                                </th>

                                                                <th>
                                                                    Salón
                                                                </th>

                                                                <th>
                                                                    Día
                                                                </th>

                                                                <th>
                                                                    Horario
                                                                </th>

                                                            </tr>

                                                        </thead>


                                                        <tbody>

                                                            {lista.map(
                                                                horario => (

                                                                    <tr
                                                                        key={
                                                                            horario.id
                                                                        }
                                                                    >

                                                                        <td>
                                                                            {
                                                                                horario.materia ||
                                                                                "—"
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                horario.grupo ||
                                                                                "—"
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                horario.salon ||
                                                                                "—"
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                obtenerDia(
                                                                                    horario.dia_semana
                                                                                )
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                horario.hora_inicio
                                                                            }
                                                                            {" - "}
                                                                            {
                                                                                horario.hora_fin
                                                                            }
                                                                        </td>

                                                                    </tr>

                                                                )
                                                            )}

                                                        </tbody>

                                                    </table>

                                                </div>

                                            )
                                        )

                                    )}

                                </div>

                            </div>

                        </div>

                    )}

        </Layout>

    );

}

export default Horarios;