import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import "../styles/docentes.css";

function Docentes() {

    const navigate = useNavigate();

    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [busqueda, setBusqueda] = useState("");

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [menuAbierto, setMenuAbierto] = useState(null);

    const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);

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

            await cargarDocentes();

        } catch (error) {

            console.error(
                "Error al guardar docente:",
                error
            );

            setError(
                "No se pudo guardar el docente."
            );

        }

    };


    /* =========================================
       ELIMINAR DOCENTE
    ========================================= */

    const eliminarDocente = async (id) => {

        const confirmar = window.confirm(
            "¿Seguro que deseas eliminar este docente?"
        );

        if (!confirmar) {
            return;
        }

        try {

            await api.delete(
                `/docentes/${id}`
            );

            await cargarDocentes();

        } catch (error) {

            console.error(
                "Error al eliminar docente:",
                error
            );

            setError(
                "No se pudo eliminar el docente."
            );

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
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Buscar por nombre, RFC o correo..."
                                value={busqueda}
                                onChange={(e) =>
                                    setBusqueda(e.target.value)
                                }
                            />

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="docentes-error">
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

                            <div className="docentes-empty">

                                <span>
                                    👨‍🏫
                                </span>

                                <strong>
                                    No hay docentes registrados
                                </strong>

                                <p>
                                    Agrega un docente para comenzar.
                                </p>

                            </div>

                        ) : (

                            <div className="docentes-table-container">

                                <table className="docentes-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                #
                                            </th>

                                            <th>
                                                Nombre
                                            </th>

                                            <th>
                                                RFC
                                            </th>

                                            <th>
                                                Teléfono
                                            </th>

                                            <th>
                                                Correo personal
                                            </th>

                                            <th>
                                                Correo institucional
                                            </th>

                                            <th>
                                                Estado
                                            </th>

                                            <th>
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
                                                                title="Asignar horario"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/horarios?docente_id=${docente.id}`
                                                                    )
                                                                }
                                                            >
                                                                📅
                                                            </button>


                                                            <div className="row-dropdown">

                                                                <button
                                                                    className="more-button"
                                                                    title="Más opciones"
                                                                    onClick={() =>
                                                                        setMenuAbierto(
                                                                            menuAbierto ===
                                                                                docente.id
                                                                                ? null
                                                                                : docente.id
                                                                        )
                                                                    }
                                                                >
                                                                    ⋯
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
                                                                                ✎ Editar
                                                                            </button>


                                                                            <button
                                                                                className="dropdown-delete"
                                                                                onClick={() => {
                                                                                    setMenuAbierto(
                                                                                        null
                                                                                    );
                                                                                    eliminarDocente(
                                                                                        docente.id
                                                                                    );
                                                                                }}
                                                                            >
                                                                                🗑 Eliminar
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

                                    <label>
                                        Nombre *
                                    </label>

                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formulario.nombre}
                                        onChange={manejarCambio}
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Apellido paterno *
                                    </label>

                                    <input
                                        type="text"
                                        name="apellido_p"
                                        value={formulario.apellido_p}
                                        onChange={manejarCambio}
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Apellido materno *
                                    </label>

                                    <input
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

                                    <label>
                                        RFC *
                                    </label>

                                    <input
                                        type="text"
                                        name="rfc"
                                        value={formulario.rfc}
                                        onChange={manejarCambio}
                                        maxLength="13"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Teléfono *
                                    </label>

                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formulario.telefono}
                                        onChange={manejarCambio}
                                        required
                                    />

                                </div>

                            </div>


                            <div className="form-group">

                                <label>
                                    Correo personal *
                                </label>

                                <input
                                    type="email"
                                    name="correo_personal"
                                    value={formulario.correo_personal}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Correo institucional *
                                </label>

                                <input
                                    type="email"
                                    name="correo_institucional"
                                    value={formulario.correo_institucional}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>


                            {modoEdicion && (

                                <div className="form-group">

                                    <label>
                                        Estado
                                    </label>

                                    <select
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
                                >
                                    {modoEdicion
                                        ? "Guardar cambios"
                                        : "Registrar docente"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </Layout>

    );

}

export default Docentes;