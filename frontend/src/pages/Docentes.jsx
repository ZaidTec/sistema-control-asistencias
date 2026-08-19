import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    GraduationCap,
    CalendarPlus,
    MoreHorizontal,
    Pencil,
    Trash2
} from "lucide-react";
import api from "../services/api";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/Toast";
import "../styles/docentes.css";

function Docentes() {

    const navigate = useNavigate();
    const toast = useToast();

    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [busqueda, setBusqueda] = useState("");

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [menuAbierto, setMenuAbierto] = useState(null);

    const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);

    const [eliminarId, setEliminarId] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const [formulario, setFormulario] = useState({
        nombre: "",
        apellido_p: "",
        apellido_m: "",
        rfc: "",
        telefono: "",
        correo_personal: "",
        correo_institucional: "",
        activo: true
    });


    /* =========================================
       CARGAR DOCENTES
    ========================================= */

    useEffect(() => {
        cargarDocentes();
    }, []);


    const cargarDocentes = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/docentes");

            setDocentes(response.data);

        } catch (error) {

            console.error("Error al cargar docentes:", error);

            setError(
                "No se pudieron cargar los docentes."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================================
       CAMBIAR CAMPOS DEL FORMULARIO
    ========================================= */

    const manejarCambio = (e) => {

        const { name, value } = e.target;

        setFormulario({
            ...formulario,
            [name]: value
        });

    };


    /* =========================================
       ABRIR MODAL NUEVO
    ========================================= */

    const nuevoDocente = () => {

        setModoEdicion(false);

        setDocenteSeleccionado(null);

        setFormulario({
            nombre: "",
            apellido_p: "",
            apellido_m: "",
            rfc: "",
            telefono: "",
            correo_personal: "",
            correo_institucional: "",
            activo: true
        });

        setMostrarModal(true);

    };


    /* =========================================
       ABRIR MODAL EDITAR
    ========================================= */

    const editarDocente = (docente) => {

        setModoEdicion(true);

        setDocenteSeleccionado(docente);

        setFormulario({
            nombre: docente.nombre || "",
            apellido_p: docente.apellido_p || "",
            apellido_m: docente.apellido_m || "",
            rfc: docente.rfc || "",
            telefono: docente.telefono || "",
            correo_personal: docente.correo_personal || "",
            correo_institucional: docente.correo_institucional || "",
            activo: docente.activo
        });

        setMostrarModal(true);

    };


    /* =========================================
       GUARDAR DOCENTE
    ========================================= */

    const guardarDocente = async (e) => {

        e.preventDefault();

        setGuardando(true);

        try {

            setError("");

            if (modoEdicion) {

                await api.put(
                    `/docentes/${docenteSeleccionado.id}`,
                    formulario
                );

            } else {

                await api.post(
                    "/docentes",
                    formulario
                );

            }

            setMostrarModal(false);

            toast(
                "success",
                modoEdicion
                    ? "Docente actualizado correctamente."
                    : "Docente registrado correctamente."
            );

            await cargarDocentes();

        } catch (error) {

            console.error(
                "Error al guardar docente:",
                error
            );

            setError(
                "No se pudo guardar el docente."
            );

        } finally {

            setGuardando(false);

        }

    };


    /* =========================================
       ELIMINAR DOCENTE
    ========================================= */

    const confirmarEliminar = async () => {

        if (!eliminarId) {
            return;
        }

        setEliminando(true);

        try {

            await api.delete(
                `/docentes/${eliminarId}`
            );

            setEliminarId(null);

            toast("success", "Docente eliminado correctamente.");

            await cargarDocentes();

        } catch (error) {

            console.error(
                "Error al eliminar docente:",
                error
            );

            setError(
                "No se pudo eliminar el docente."
            );

        } finally {

            setEliminando(false);

        }

    };


    /* =========================================
       FILTRAR DOCENTES
    ========================================= */

    const docentesFiltrados = docentes.filter((docente) => {

        const texto = busqueda.toLowerCase();

        const nombreCompleto =
            `${docente.nombre} ${docente.apellido_p} ${docente.apellido_m}`
                .toLowerCase();

        return (
            nombreCompleto.includes(texto) ||
            docente.rfc?.toLowerCase().includes(texto) ||
            docente.correo_personal?.toLowerCase().includes(texto) ||
            docente.correo_institucional?.toLowerCase().includes(texto)
        );

    });


    return (

        <Layout titulo="Docentes">

            {/* =========================================
                ENCABEZADO
            ========================================== */}

                    <section className="page-title">

                        <div>

                            <h2>
                                Docentes registrados
                            </h2>

                            <p>
                                Administración de los profesores
                                registrados en el sistema.
                            </p>

                        </div>


                        <button
                            className="new-button"
                            onClick={nuevoDocente}
                        >
                            + Nuevo docente
                        </button>

                    </section>


                    {/* =========================================
                        BUSCADOR
                    ========================================== */}

                    <section className="docentes-card">

                        <div className="search-container">

                            <span className="search-icon">
                                <Search size={15} />
                            </span>

                            <input
                                type="text"
                                placeholder="Buscar por nombre, RFC o correo..."
                                aria-label="Buscar por nombre, RFC o correo"
                                value={busqueda}
                                onChange={(e) =>
                                    setBusqueda(e.target.value)
                                }
                            />

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="docentes-error" role="alert">
                                {error}
                            </div>

                        )}


                        {/* =========================================
                            TABLA
                        ========================================== */}

                        {loading ? (

                            <div className="docentes-loading">
                                Cargando docentes...
                            </div>

                        ) : docentesFiltrados.length === 0 ? (

                            <EmptyState
                                icon={GraduationCap}
                                title="No hay docentes registrados"
                                text="Agrega un docente para comenzar."
                            />

                        ) : (

                            <div className="docentes-table-container">

                                <table className="docentes-table">

                                    <thead>

                                        <tr>

                                            <th scope="col">
                                                #
                                            </th>

                                            <th scope="col">
                                                Nombre
                                            </th>

                                            <th scope="col">
                                                RFC
                                            </th>

                                            <th scope="col">
                                                Teléfono
                                            </th>

                                            <th scope="col">
                                                Correo personal
                                            </th>

                                            <th scope="col">
                                                Correo institucional
                                            </th>

                                            <th scope="col">
                                                Estado
                                            </th>

                                            <th scope="col">
                                                Acciones
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {docentesFiltrados.map(
                                            (docente, index) => (

                                                <tr
                                                    key={docente.id}
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>


                                                    <td>

                                                        <div className="docente-name">

                                                            <div className="docente-avatar">
                                                                {docente.nombre
                                                                    ?.charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {docente.nombre}{" "}
                                                                    {docente.apellido_p}{" "}
                                                                    {docente.apellido_m}
                                                                </strong>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>
                                                        {docente.rfc}
                                                    </td>


                                                    <td>
                                                        {docente.telefono}
                                                    </td>


                                                    <td>
                                                        {docente.correo_personal}
                                                    </td>


                                                    <td>
                                                        {docente.correo_institucional}
                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                docente.activo
                                                                    ? "docente-status activo"
                                                                    : "docente-status inactivo"
                                                            }
                                                        >
                                                            {docente.activo
                                                                ? "Activo"
                                                                : "Inactivo"}
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="action-buttons">

                                                            <button
                                                                className="assign-button"
                                                                aria-label={`Asignar horario a ${docente.nombre}`}
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/horarios?docente_id=${docente.id}`
                                                                    )
                                                                }
                                                            >
                                                                <CalendarPlus size={15} />
                                                            </button>


                                                            <div className="row-dropdown">

                                                                <button
                                                                    className="more-button"
                                                                    aria-label="Más opciones"
                                                                    onClick={() =>
                                                                        setMenuAbierto(
                                                                            menuAbierto ===
                                                                                docente.id
                                                                                ? null
                                                                                : docente.id
                                                                        )
                                                                    }
                                                                >
                                                                    <MoreHorizontal size={15} />
                                                                </button>


                                                                {menuAbierto ===
                                                                    docente.id && (

                                                                    <>
                                                                        <div
                                                                            className="dropdown-backdrop"
                                                                            onClick={() =>
                                                                                setMenuAbierto(
                                                                                    null
                                                                                )
                                                                            }
                                                                        />

                                                                        <div className="dropdown-menu">

                                                                            <button
                                                                                onClick={() => {
                                                                                    setMenuAbierto(
                                                                                        null
                                                                                    );
                                                                                    editarDocente(
                                                                                        docente
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <Pencil size={14} />
                                                                                Editar
                                                                            </button>


<button
                                                                className="dropdown-delete"
                                                                onClick={() => {
                                                                    setMenuAbierto(
                                                                        null
                                                                    );
                                                                    setEliminarId(
                                                                        docente.id
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                                Eliminar
                                                            </button>

                                                                        </div>
                                                                    </>

                                                                )}

                                                            </div>

                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>


            {/* =========================================
                MODAL
            ========================================== */}

            {mostrarModal && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setMostrarModal(false)
                    }
                >

                    <div
                        className="docente-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {modoEdicion
                                        ? "Editar docente"
                                        : "Nuevo docente"}
                                </h2>

                                <p>
                                    {modoEdicion
                                        ? "Modifica los datos del docente."
                                        : "Registra los datos del docente."}
                                </p>

                            </div>


                            <button
                                className="close-modal"
                                onClick={() =>
                                    setMostrarModal(false)
                                }
                                aria-label="Cerrar"
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={guardarDocente}
                            className="docente-form"
                        >


                            <div className="form-row">

                                <div className="form-group">

                                    <label htmlFor="docente-nombre">
                                        Nombre *
                                    </label>

                                    <input
                                        id="docente-nombre"
                                        type="text"
                                        name="nombre"
                                        value={formulario.nombre}
                                        onChange={manejarCambio}
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="docente-apellido-p">
                                        Apellido paterno *
                                    </label>

                                    <input
                                        id="docente-apellido-p"
                                        type="text"
                                        name="apellido_p"
                                        value={formulario.apellido_p}
                                        onChange={manejarCambio}
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="docente-apellido-m">
                                        Apellido materno *
                                    </label>

                                    <input
                                        id="docente-apellido-m"
                                        type="text"
                                        name="apellido_m"
                                        value={formulario.apellido_m}
                                        onChange={manejarCambio}
                                        required
                                    />

                                </div>

                            </div>


                            <div className="form-row">

                                <div className="form-group">

                                    <label htmlFor="docente-rfc">
                                        RFC *
                                    </label>

                                    <input
                                        id="docente-rfc"
                                        type="text"
                                        name="rfc"
                                        value={formulario.rfc}
                                        onChange={manejarCambio}
                                        maxLength="13"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="docente-telefono">
                                        Teléfono *
                                    </label>

                                    <input
                                        id="docente-telefono"
                                        type="tel"
                                        name="telefono"
                                        value={formulario.telefono}
                                        onChange={manejarCambio}
                                        required
                                    />

                                </div>

                            </div>


                            <div className="form-group">

                                <label htmlFor="docente-correo-personal">
                                    Correo personal *
                                </label>

                                <input
                                    id="docente-correo-personal"
                                    type="email"
                                    name="correo_personal"
                                    value={formulario.correo_personal}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="docente-correo-institucional">
                                    Correo institucional *
                                </label>

                                <input
                                    id="docente-correo-institucional"
                                    type="email"
                                    name="correo_institucional"
                                    value={formulario.correo_institucional}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>


                            {modoEdicion && (

                                <div className="form-group">

                                    <label htmlFor="docente-estado">
                                        Estado
                                    </label>

                                    <select
                                        id="docente-estado"
                                        name="activo"
                                        value={
                                            formulario.activo
                                                ? "true"
                                                : "false"
                                        }
                                        onChange={(e) =>
                                            setFormulario({
                                                ...formulario,
                                                activo:
                                                    e.target.value ===
                                                    "true"
                                            })
                                        }
                                    >

                                        <option value="true">
                                            Activo
                                        </option>

                                        <option value="false">
                                            Inactivo
                                        </option>

                                    </select>

                                </div>

                            )}


                            <div className="modal-buttons">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        setMostrarModal(false)
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={guardando}
                                >
                                    {guardando
                                        ? "Guardando..."
                                        : (modoEdicion
                                            ? "Guardar cambios"
                                            : "Registrar docente")}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            <ConfirmDialog
                open={eliminarId !== null}
                title="Eliminar docente"
                message="¿Seguro que deseas eliminar este docente?"
                onCancel={() => setEliminarId(null)}
                onConfirm={confirmarEliminar}
                loading={eliminando}
            />

        </Layout>

    );

}

export default Docentes;