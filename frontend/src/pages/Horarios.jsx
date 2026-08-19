import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList, Plus, UserRound } from "lucide-react";
import api from "../services/api";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import "../styles/horarios.css";

function Horarios() {

    const [searchParams] = useSearchParams();

    const toast = useToast();

    const [periodos, setPeriodos] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [salones, setSalones] = useState([]);

    const [horarios, setHorarios] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [eliminarId, setEliminarId] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    const [mostrarHorarios, setMostrarHorarios] = useState(false);

    const [modalAlta, setModalAlta] = useState(null);
    const [altaForm, setAltaForm] = useState({});
    const [altaError, setAltaError] = useState("");
    const [guardandoAlta, setGuardandoAlta] = useState(false);

    const [formulario, setFormulario] = useState({
        periodo_id: "",
        docente_id: "",
        materia_id: "",
        grupo_id: "",
        salon_id: "",
        dia_semana: "",
        hora_inicio: "",
        hora_fin: "",
        color: "#1558c7"
    });


    const dias = [
        { id: 1, nombre: "Lunes" },
        { id: 2, nombre: "Martes" },
        { id: 3, nombre: "Miércoles" },
        { id: 4, nombre: "Jueves" },
        { id: 5, nombre: "Viernes" }
    ];

    const colores = [
        "#1558c7",
        "#0e6e4c",
        "#b45309",
        "#be123c",
        "#6d28d9",
        "#0369a1",
        "#a16207"
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

            const periodoActivo =
                periodosResponse.data.find(
                    (periodo) => periodo.activo
                );

            if (periodoActivo) {

                setFormulario((prev) => ({
                    ...prev,
                    periodo_id: String(periodoActivo.id)
                }));

            }

        } catch (error) {

            console.error(
                "Error al cargar datos:",
                error
            );

            setError(
                "No se pudieron cargar los catálogos."
            );

        }

    };


    /* =========================================
       CARGAR HORARIOS
    ========================================== */

    const cargarHorarios = useCallback(async () => {

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

    }, [formulario.periodo_id]);


    useEffect(() => {

        cargarHorarios();

    }, [cargarHorarios]);


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

                    color:
                        formulario.color,

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

    const confirmarEliminar = async () => {

        if (!eliminarId) {
            return;
        }

        setEliminando(true);

        try {

            await api.delete(
                `/asignaciones/${eliminarId}`
            );

            setEliminarId(null);

            toast("success", "Horario eliminado correctamente.");

            cargarHorarios();

        } catch (error) {

            console.error(
                "Error al eliminar horario:",
                error
            );

            setError(
                "No se pudo eliminar el horario."
            );

        } finally {

            setEliminando(false);

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


    const obtenerHorariosDia = (dia) => {

        return horarios.filter(
            horario =>
                Number(horario.dia_semana) === dia
        );

    };


    const obtenerDia = (numero) => {

        const dia = dias.find(
            item => item.id === Number(numero)
        );

        return dia
            ? dia.nombre
            : "";

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


    /* =========================================
       ALTA RÁPIDA (DOCENTE / MATERIA / GRUPO / SALÓN)
    ========================================== */

    const tituloAlta =
        modalAlta === "docente"
            ? "Agregar docente"
            : modalAlta === "materia"
                ? "Agregar materia"
                : modalAlta === "grupo"
                    ? "Agregar grupo"
                    : modalAlta === "salon"
                        ? "Agregar salón"
                        : "";


    const abrirAlta = (tipo) => {

        setAltaError("");
        setAltaForm({});
        setModalAlta(tipo);

    };


    const manejarCambioAlta = (e) => {

        const { name, value } = e.target;

        setAltaForm((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    const actualizarCatalogo = (tipo, nuevo) => {

        if (tipo === "docente") {
            setDocentes((prev) => [...prev, nuevo]);
        } else if (tipo === "materia") {
            setMaterias((prev) => [...prev, nuevo]);
        } else if (tipo === "grupo") {
            setGrupos((prev) => [...prev, nuevo]);
        } else if (tipo === "salon") {
            setSalones((prev) => [...prev, nuevo]);
        }

    };


    const guardarAlta = async (e) => {

        e.preventDefault();

        setAltaError("");

        const tipo = modalAlta;

        if (!tipo) {
            return;
        }

        let endpoint = "";
        let camposObligatorios = [];

        if (tipo === "docente") {
            endpoint = "/docentes";
            camposObligatorios = [
                "nombre",
                "apellido_p",
                "apellido_m",
                "rfc",
                "telefono",
                "correo_personal",
                "correo_institucional"
            ];
        } else if (tipo === "materia") {
            endpoint = "/materias";
            camposObligatorios = ["clave", "nombre"];
        } else if (tipo === "grupo") {
            endpoint = "/grupos";
            camposObligatorios = ["clave", "semestre"];
        } else if (tipo === "salon") {
            endpoint = "/salones";
            camposObligatorios = ["numero"];
        }

        const faltaCampo =
            camposObligatorios.some(
                (campo) =>
                    !String(
                        altaForm[campo] || ""
                    ).trim()
            );

        if (faltaCampo) {

            setAltaError(
                "Todos los campos son obligatorios."
            );

            return;

        }

        setGuardandoAlta(true);

        try {

            const response = await api.post(
                endpoint,
                altaForm
            );

            const nuevo = response.data;

            actualizarCatalogo(tipo, nuevo);

            setFormulario((prev) => ({
                ...prev,
                [tipo + "_id"]: String(nuevo.id)
            }));

            setModalAlta(null);

            toast(
                "success",
                `${tituloAlta.replace("Agregar ", "")} agregado correctamente.`
            );

        } catch (error) {

            console.error(
                "Error al guardar alta rápida:",
                error
            );

            setAltaError(
                error.response?.data?.mensaje ||
                "No se pudo guardar. Inténtalo de nuevo."
            );

        } finally {

            setGuardandoAlta(false);

        }

    };


    return (

        <Layout titulo="Calendario">

            <section className="page-title">

                <div>

                    <h2>
                        Calendario de horarios
                    </h2>

                    <p>
                        Consulta la programación semanal de clases.
                    </p>

                </div>

            </section>

            {error && (

                <div className="horarios-error" role="alert">
                    {error}
                </div>

            )}

            {mensaje && (

                <div className="horarios-success" role="status">
                    {mensaje}
                </div>

            )}

            <div className="horarios-grid">

                <section className="horario-form-card">

                    <div className="card-header">

                        <div>

                            <h3>
                                Registrar horario
                            </h3>

                            <p>
                                Agrega la programación semanal de clases.
                            </p>

                        </div>

                    </div>


                    <form
                        className="horario-form"
                        onSubmit={registrarHorario}
                    >

                        <div className="form-group">

                            <label htmlFor="periodo_id">Periodo</label>

                            <select
                                id="periodo_id"
                                name="periodo_id"
                                value={formulario.periodo_id}
                                onChange={manejarCambio}
                            >

                                <option value="">Selecciona un periodo</option>

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


                        <div className="form-group">

                            <label htmlFor="docente_id">Docente</label>

                            <div className="field-row">

                                <select
                                    id="docente_id"
                                    name="docente_id"
                                    value={formulario.docente_id}
                                    onChange={manejarCambio}
                                >

                                    <option value="">Selecciona un docente</option>

                                    {docentes.map((docente) => (

                                        <option
                                            key={docente.id}
                                            value={docente.id}
                                        >

                                            {obtenerNombreDocente(docente)}

                                        </option>

                                    ))}

                                </select>

                                <button
                                    type="button"
                                    className="add-button"
                                    onClick={() => abrirAlta("docente")}
                                    aria-label="Agregar docente"
                                >
                                    <Plus size={15} />
                                </button>

                            </div>

                        </div>


                        <div className="form-group">

                            <label htmlFor="materia_id">Materia</label>

                            <div className="field-row">

                                <select
                                    id="materia_id"
                                    name="materia_id"
                                    value={formulario.materia_id}
                                    onChange={manejarCambio}
                                >

                                    <option value="">Selecciona una materia</option>

                                    {materias.map((materia) => (

                                        <option
                                            key={materia.id}
                                            value={materia.id}
                                        >

                                            {materia.nombre}

                                        </option>

                                    ))}

                                </select>

                                <button
                                    type="button"
                                    className="add-button"
                                    onClick={() => abrirAlta("materia")}
                                    aria-label="Agregar materia"
                                >
                                    <Plus size={15} />
                                </button>

                            </div>

                        </div>


                        <div className="form-group">

                            <label htmlFor="grupo_id">Grupo</label>

                            <div className="field-row">

                                <select
                                    id="grupo_id"
                                    name="grupo_id"
                                    value={formulario.grupo_id}
                                    onChange={manejarCambio}
                                >

                                    <option value="">Selecciona un grupo</option>

                                    {grupos.map((grupo) => (

                                        <option
                                            key={grupo.id}
                                            value={grupo.id}
                                        >

                                            {grupo.clave}

                                        </option>

                                    ))}

                                </select>

                                <button
                                    type="button"
                                    className="add-button"
                                    onClick={() => abrirAlta("grupo")}
                                    aria-label="Agregar grupo"
                                >
                                    <Plus size={15} />
                                </button>

                            </div>

                        </div>


                        <div className="form-group">

                            <label htmlFor="salon_id">Salón</label>

                            <div className="field-row">

                                <select
                                    id="salon_id"
                                    name="salon_id"
                                    value={formulario.salon_id}
                                    onChange={manejarCambio}
                                >

                                    <option value="">Selecciona un salón</option>

                                    {salones.map((salon) => (

                                        <option
                                            key={salon.id}
                                            value={salon.id}
                                        >

                                            Salón {salon.numero}

                                        </option>

                                    ))}

                                </select>

                                <button
                                    type="button"
                                    className="add-button"
                                    onClick={() => abrirAlta("salon")}
                                    aria-label="Agregar salón"
                                >
                                    <Plus size={15} />
                                </button>

                            </div>

                        </div>


                        <div className="form-group">

                            <label htmlFor="dia_semana">Día</label>

                            <select
                                id="dia_semana"
                                name="dia_semana"
                                value={formulario.dia_semana}
                                onChange={manejarCambio}
                            >

                                <option value="">Selecciona un día</option>

                                {dias.map((dia) => (

                                    <option
                                        key={dia.id}
                                        value={dia.id}
                                    >

                                        {dia.nombre}

                                    </option>

                                ))}

                            </select>

                        </div>


                        <div className="time-grid">

                            <div className="form-group">

                                <label htmlFor="hora_inicio">Hora inicio</label>

                                <input
                                    id="hora_inicio"
                                    type="time"
                                    name="hora_inicio"
                                    value={formulario.hora_inicio}
                                    onChange={manejarCambio}
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="hora_fin">Hora fin</label>

                                <input
                                    id="hora_fin"
                                    type="time"
                                    name="hora_fin"
                                    value={formulario.hora_fin}
                                    onChange={manejarCambio}
                                />

                            </div>

                        </div>


                        <div className="form-group">

                            <span id="color_label" className="color-label">
                                Color de la clase
                            </span>

                            <div
                                className="color-selector"
                                role="group"
                                aria-labelledby="color_label"
                            >

                                {colores.map((color) => (

                                    <button
                                        type="button"
                                        key={color}
                                        className={
                                            formulario.color === color
                                                ? "color-swatch color-swatch-active"
                                                : "color-swatch"
                                        }
                                        style={{ background: color }}
                                        onClick={() =>
                                            setFormulario({
                                                ...formulario,
                                                color
                                            })
                                        }
                                        aria-label={`Usar color ${color}`}
                                        aria-pressed={
                                            formulario.color === color
                                        }
                                    />

                                ))}

                                <label
                                    className="color-custom"
                                    title="Color personalizado"
                                >

                                    <input
                                        type="color"
                                        value={formulario.color}
                                        onChange={(e) =>
                                            setFormulario({
                                                ...formulario,
                                                color: e.target.value
                                            })
                                        }
                                        aria-label="Elegir color personalizado"
                                    />

                                </label>

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="save-button"
                            disabled={loading}
                        >

                            {loading ? "Guardando..." : "Guardar horario"}

                        </button>

                    </form>

                </section>


                <section className="calendar-card">

                    <div className="card-header">

                        <div>

                            <h3>
                                Calendario semanal
                            </h3>

                            <p>
                                Visualización de las clases programadas.
                            </p>

                        </div>


                        <button
                            className="view-horarios-button"
                            onClick={() =>
                                setMostrarHorarios(true)
                            }
                        >
                            <ClipboardList size={15} />
                            Ver horarios
                        </button>

                    </div>


                    <div className="calendar-container">

                        {dias.map((dia) => (

                            <div
                                className="calendar-day"
                                key={dia.id}
                            >

                                <div className="calendar-day-title">
                                    {dia.nombre}
                                </div>


                                <div className="calendar-day-content">

                                    {obtenerHorariosDia(dia.id).length === 0 ? (

                                        <span className="no-class">
                                            Sin clases
                                        </span>

                                    ) : (

                                        obtenerHorariosDia(dia.id).map((horario) => (

                                            <div
                                                className="class-block"
                                                key={horario.id}
                                                style={{
                                                    "--clase-color":
                                                        horario.color ||
                                                        "#1558c7"
                                                }}
                                            >

                                                <div className="class-time">
                                                    {horario.hora_inicio} - {horario.hora_fin}
                                                </div>


                                                <strong>
                                                    {horario.materia || "Materia"}
                                                </strong>


                                                <span>
                                                    {horario.docente || "Docente"}
                                                </span>


                                                <span>
                                                    Grupo: {horario.grupo || "—"}
                                                </span>


                                                <span>
                                                    Salón: {horario.salon || "—"}
                                                </span>


                                                <button
                                                    type="button"
                                                    className="delete-class"
                                                    onClick={() => setEliminarId(horario.id)}
                                                >
                                                    Eliminar
                                                </button>

                                            </div>

                                        ))

                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                </section>

            </div>

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
                                    Clases asignadas agrupadas por docente.
                                </p>

                            </div>


                            <button
                                className="close-modal"
                                onClick={() =>
                                    setMostrarHorarios(false)
                                }
                                aria-label="Cerrar"
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
                                                    <UserRound size={14} />
                                                    {docente}
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
                                                            Día
                                                        </th>

                                                        <th scope="col">
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


            <Modal
                open={Boolean(modalAlta)}
                onClose={() => setModalAlta(null)}
                title={tituloAlta}
                description="Los datos nuevos quedan disponibles de inmediato en el formulario."
            >

                <form
                    className="quick-alta-form"
                    onSubmit={guardarAlta}
                >

                    {modalAlta === "docente" && (

                        <>

                            <div className="form-group">

                                <label htmlFor="alta_nombre">Nombre</label>

                                <input
                                    id="alta_nombre"
                                    name="nombre"
                                    value={altaForm.nombre || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="alta_apellido_p">Apellido paterno</label>

                                <input
                                    id="alta_apellido_p"
                                    name="apellido_p"
                                    value={altaForm.apellido_p || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="alta_apellido_m">Apellido materno</label>

                                <input
                                    id="alta_apellido_m"
                                    name="apellido_m"
                                    value={altaForm.apellido_m || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="alta_rfc">RFC</label>

                                <input
                                    id="alta_rfc"
                                    name="rfc"
                                    maxLength="13"
                                    value={altaForm.rfc || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="alta_telefono">Teléfono</label>

                                <input
                                    id="alta_telefono"
                                    name="telefono"
                                    value={altaForm.telefono || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="alta_correo_personal">
                                    Correo personal
                                </label>

                                <input
                                    id="alta_correo_personal"
                                    name="correo_personal"
                                    type="email"
                                    value={altaForm.correo_personal || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="alta_correo_institucional">
                                    Correo institucional
                                </label>

                                <input
                                    id="alta_correo_institucional"
                                    name="correo_institucional"
                                    type="email"
                                    value={altaForm.correo_institucional || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>

                        </>

                    )}


                    {modalAlta === "materia" && (

                        <>

                            <div className="form-group">

                                <label htmlFor="alta_clave">Clave</label>

                                <input
                                    id="alta_clave"
                                    name="clave"
                                    maxLength="20"
                                    value={altaForm.clave || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="alta_nombre_materia">Nombre</label>

                                <input
                                    id="alta_nombre_materia"
                                    name="nombre"
                                    value={altaForm.nombre || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>

                        </>

                    )}


                    {modalAlta === "grupo" && (

                        <>

                            <div className="form-group">

                                <label htmlFor="alta_grupo_clave">Clave</label>

                                <input
                                    id="alta_grupo_clave"
                                    name="clave"
                                    maxLength="20"
                                    value={altaForm.clave || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="alta_semestre">Semestre</label>

                                <input
                                    id="alta_semestre"
                                    name="semestre"
                                    maxLength="3"
                                    value={altaForm.semestre || ""}
                                    onChange={manejarCambioAlta}
                                />

                            </div>

                        </>

                    )}


                    {modalAlta === "salon" && (

                        <div className="form-group">

                            <label htmlFor="alta_numero">Número del salón</label>

                            <input
                                id="alta_numero"
                                name="numero"
                                maxLength="10"
                                value={altaForm.numero || ""}
                                onChange={manejarCambioAlta}
                            />

                        </div>

                    )}


                    {altaError && (

                        <div className="horarios-error" role="alert">
                            {altaError}
                        </div>

                    )}


                    <button
                        type="submit"
                        className="save-button"
                        disabled={guardandoAlta}
                    >
                        {guardandoAlta ? "Guardando..." : "Guardar"}
                    </button>

                </form>

            </Modal>


            <ConfirmDialog
                open={Boolean(eliminarId)}
                title="Eliminar horario"
                message="¿Deseas eliminar este horario del calendario?"
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={confirmarEliminar}
                onCancel={() => setEliminarId(null)}
                loading={eliminando}
            />

        </Layout>

    );

}

export default Horarios;