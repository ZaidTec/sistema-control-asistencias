import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList, UserRound } from "lucide-react";
import api from "../services/api";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ui/ConfirmDialog";
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

    const [mostrarHorarios, setMostrarHorarios] = useState(false);

    const [eliminarId, setEliminarId] = useState(null);
    const [eliminando, setEliminando] = useState(false);

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

                        </div>


                        <div className="form-group">

                            <label htmlFor="materia_id">Materia</label>

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

                        </div>


                        <div className="form-group">

                            <label htmlFor="grupo_id">Grupo</label>

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

                        </div>


                        <div className="form-group">

                            <label htmlFor="salon_id">Salón</label>

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