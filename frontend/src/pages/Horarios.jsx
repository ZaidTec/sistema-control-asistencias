import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
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

    const [eliminarId, setEliminarId] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    const [formulario, setFormulario] = useState({
        periodo_id: "",
        docente_id: ""
    });

    const crearFila = () => ({
        materia_id: "",
        grupo_id: "",
        salon_id: "",
        dia_semana: "",
        hora_inicio: "",
        hora_fin: ""
    });

    const [clases, setClases] = useState([crearFila()]);


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

    const manejarCambioFila = (indice, e) => {
        const { name, value } = e.target;

        setClases((filas) => filas.map((fila, filaIndice) => (
            filaIndice === indice ? { ...fila, [name]: value } : fila
        )));

        setMensaje("");
        setError("");
    };

    const agregarFila = () => setClases((filas) => [...filas, crearFila()]);

    const eliminarFila = (indice) => {
        setClases((filas) => filas.length === 1
            ? filas
            : filas.filter((_, filaIndice) => filaIndice !== indice));
    };


    /* =========================================
       REGISTRAR HORARIO
    ========================================== */

    const registrarHorario = async (e) => {

        e.preventDefault();

        setError("");
        setMensaje("");


        if (!formulario.periodo_id || !formulario.docente_id) {

            setError(
                "Completa todos los campos."
            );

            return;

        }


        try {

            setLoading(true);

            await api.post("/asignaciones/masivas", {
                periodo_id: Number(formulario.periodo_id),
                docente_id: Number(formulario.docente_id),
                clases: clases.map((clase) => ({
                    ...clase,
                    materia_id: Number(clase.materia_id),
                    grupo_id: Number(clase.grupo_id),
                    salon_id: Number(clase.salon_id),
                    dia_semana: Number(clase.dia_semana)
                }))
            });


            setMensaje(
                "Horario registrado correctamente."
            );


            setClases([crearFila()]);


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

                    setError(error.response.data.fila
                        ? `La fila ${error.response.data.fila}: ${error.response.data.mensaje}`
                        : error.response.data.mensaje);

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

            {error && <div className="horarios-error" role="alert">{error}</div>}
            {mensaje && <div className="horarios-success" role="status">{mensaje}</div>}

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


                    <form className="horario-form" onSubmit={registrarHorario}>
                        <div className="common-fields">
                            <div className="form-group">
                                <label htmlFor="periodo_id">Periodo</label>
                                <select id="periodo_id" name="periodo_id" value={formulario.periodo_id} onChange={manejarCambio}>
                                    <option value="">Selecciona un periodo</option>
                                    {periodos.map((periodo) => <option key={periodo.id} value={periodo.id}>{periodo.nombre}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="docente_id">Docente</label>
                                <select id="docente_id" name="docente_id" value={formulario.docente_id} onChange={manejarCambio}>
                                    <option value="">Selecciona un docente</option>
                                    {docentes.map((docente) => <option key={docente.id} value={docente.id}>{obtenerNombreDocente(docente)}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="class-rows-header">
                            <strong>Clases por registrar</strong>
                            <span>{clases.length} {clases.length === 1 ? "fila" : "filas"}</span>
                        </div>

                        <div className="class-rows">
                            {clases.map((clase, indice) => (
                                <div className="class-row" key={indice}>
                                    <span className="class-row-number">{indice + 1}</span>
                                    <div className="form-group">
                                        <label htmlFor={`materia_id_${indice}`}>Materia</label>
                                        <select id={`materia_id_${indice}`} name="materia_id" value={clase.materia_id} onChange={(e) => manejarCambioFila(indice, e)}>
                                            <option value="">Selecciona</option>
                                            {materias.map((materia) => <option key={materia.id} value={materia.id}>{materia.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`grupo_id_${indice}`}>Grupo</label>
                                        <select id={`grupo_id_${indice}`} name="grupo_id" value={clase.grupo_id} onChange={(e) => manejarCambioFila(indice, e)}>
                                            <option value="">Selecciona</option>
                                            {grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.clave}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`salon_id_${indice}`}>Salón</label>
                                        <select id={`salon_id_${indice}`} name="salon_id" value={clase.salon_id} onChange={(e) => manejarCambioFila(indice, e)}>
                                            <option value="">Selecciona</option>
                                            {salones.map((salon) => <option key={salon.id} value={salon.id}>Salón {salon.numero}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`dia_semana_${indice}`}>Día</label>
                                        <select id={`dia_semana_${indice}`} name="dia_semana" value={clase.dia_semana} onChange={(e) => manejarCambioFila(indice, e)}>
                                            <option value="">Selecciona</option>
                                            {dias.map((dia) => <option key={dia.id} value={dia.id}>{dia.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`hora_inicio_${indice}`}>Inicio</label>
                                        <input id={`hora_inicio_${indice}`} type="time" name="hora_inicio" value={clase.hora_inicio} onChange={(e) => manejarCambioFila(indice, e)} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`hora_fin_${indice}`}>Fin</label>
                                        <input id={`hora_fin_${indice}`} type="time" name="hora_fin" value={clase.hora_fin} onChange={(e) => manejarCambioFila(indice, e)} />
                                    </div>
                                    <button type="button" className="remove-row-button" onClick={() => eliminarFila(indice)} disabled={clases.length === 1} title="Eliminar fila" aria-label="Eliminar fila">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="form-actions">
                            <button type="button" className="add-row-button" onClick={agregarFila} disabled={loading}>
                                <Plus size={16} /> Agregar otra clase
                            </button>
                            <button type="submit" className="save-button" disabled={loading}>
                                {loading ? "Guardando..." : `Guardar ${clases.length} ${clases.length === 1 ? "clase" : "clases"}`}
                            </button>
                        </div>
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