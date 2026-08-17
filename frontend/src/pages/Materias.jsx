import { useEffect, useState } from "react";
import api from "../services/api";
import logo from "../assets/logo.jpg";
import "../styles/materias.css";

function Materias() {

    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [busqueda, setBusqueda] = useState("");

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

    const [formulario, setFormulario] = useState({
        clave: "",
        nombre: "",
        activo: true
    });


    /* =========================================
       CARGAR MATERIAS
    ========================================= */

    useEffect(() => {
        cargarMaterias();
    }, []);


    const cargarMaterias = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/materias");

            setMaterias(response.data);

        } catch (error) {

            console.error("Error al cargar materias:", error);

            setError(
                "No se pudieron cargar las materias."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================================
       CAMBIAR CAMPOS
    ========================================= */

    const manejarCambio = (e) => {

        const { name, value } = e.target;

        setFormulario({
            ...formulario,
            [name]: value
        });

    };


    /* =========================================
       NUEVA MATERIA
    ========================================= */

    const nuevaMateria = () => {

        setModoEdicion(false);

        setMateriaSeleccionada(null);

        setFormulario({
            clave: "",
            nombre: "",
            activo: true
        });

        setMostrarModal(true);

    };


    /* =========================================
       EDITAR MATERIA
    ========================================= */

    const editarMateria = (materia) => {

        setModoEdicion(true);

        setMateriaSeleccionada(materia);

        setFormulario({
            clave: materia.clave || "",
            nombre: materia.nombre || "",
            activo: materia.activo
        });

        setMostrarModal(true);

    };


    /* =========================================
       GUARDAR MATERIA
    ========================================= */

    const guardarMateria = async (e) => {

        e.preventDefault();

        try {

            setError("");

            if (modoEdicion) {

                await api.put(
                    `/materias/${materiaSeleccionada.id}`,
                    formulario
                );

            } else {

                await api.post(
                    "/materias",
                    formulario
                );

            }

            setMostrarModal(false);

            await cargarMaterias();

        } catch (error) {

            console.error(
                "Error al guardar materia:",
                error
            );

            setError(
                "No se pudo guardar la materia."
            );

        }

    };


    /* =========================================
       ELIMINAR MATERIA
    ========================================= */

    const eliminarMateria = async (id) => {

        const confirmar = window.confirm(
            "¿Seguro que deseas eliminar esta materia?"
        );

        if (!confirmar) {
            return;
        }

        try {

            await api.delete(
                `/materias/${id}`
            );

            await cargarMaterias();

        } catch (error) {

            console.error(
                "Error al eliminar materia:",
                error
            );

            setError(
                "No se pudo eliminar la materia."
            );

        }

    };


    /* =========================================
       FILTRAR MATERIAS
    ========================================= */

    const materiasFiltradas = materias.filter((materia) => {

        const texto = busqueda.toLowerCase();

        return (
            materia.clave
                ?.toLowerCase()
                .includes(texto) ||

            materia.nombre
                ?.toLowerCase()
                .includes(texto)
        );

    });


    return (

        <div className="materias-layout">


            {/* =========================================
                SIDEBAR
            ========================================== */}

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

                    <button
                        className="menu-item"
                        onClick={() => {
                            window.location.href = "/dashboard";
                        }}
                    >
                        <span>▦</span>
                        Dashboard
                    </button>


                    <button
                        className="menu-item"
                        onClick={() => {
                            window.location.href = "/docentes";
                        }}
                    >
                        <span>♙</span>
                        Docentes
                    </button>


                    <button className="menu-item active">

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


            {/* =========================================
                CONTENIDO PRINCIPAL
            ========================================== */}

            <main className="materias-main">


                {/* HEADER */}

                <header className="dashboard-header">

                    <h1>
                        Materias
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


                <div className="materias-content">


                    {/* =========================================
                        TÍTULO
                    ========================================== */}

                    <section className="page-title">

                        <div>

                            <h2>
                                Catálogo de materias
                            </h2>

                            <p>
                                Administración de las materias
                                disponibles para las asignaciones.
                            </p>

                        </div>


                        <button
                            className="new-button"
                            onClick={nuevaMateria}
                        >
                            + Nueva materia
                        </button>

                    </section>


                    {/* =========================================
                        TARJETA
                    ========================================== */}

                    <section className="materias-card">


                        {/* BUSCADOR */}

                        <div className="search-container">

                            <span className="search-icon">
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Buscar por clave o nombre..."
                                value={busqueda}
                                onChange={(e) =>
                                    setBusqueda(e.target.value)
                                }
                            />

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="materias-error">
                                {error}
                            </div>

                        )}


                        {/* =========================================
                            TABLA
                        ========================================== */}

                        {loading ? (

                            <div className="materias-loading">
                                Cargando materias...
                            </div>

                        ) : materiasFiltradas.length === 0 ? (

                            <div className="materias-empty">

                                <span>
                                    📚
                                </span>

                                <strong>
                                    No hay materias registradas
                                </strong>

                                <p>
                                    Agrega una materia para comenzar.
                                </p>

                            </div>

                        ) : (

                            <div className="materias-table-container">

                                <table className="materias-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                #
                                            </th>

                                            <th>
                                                Clave
                                            </th>

                                            <th>
                                                Nombre de la materia
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

                                        {materiasFiltradas.map(
                                            (materia, index) => (

                                                <tr
                                                    key={materia.id}
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>


                                                    <td>

                                                        <span className="materia-clave">
                                                            {materia.clave}
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="materia-name">

                                                            <div className="materia-icon">
                                                                📚
                                                            </div>

                                                            <strong>
                                                                {materia.nombre}
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                materia.activo
                                                                    ? "materia-status activo"
                                                                    : "materia-status inactivo"
                                                            }
                                                        >

                                                            {materia.activo
                                                                ? "Activo"
                                                                : "Inactivo"}

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="action-buttons">

                                                            <button
                                                                className="edit-button"
                                                                title="Editar"
                                                                onClick={() =>
                                                                    editarMateria(
                                                                        materia
                                                                    )
                                                                }
                                                            >
                                                                ✎
                                                            </button>


                                                            <button
                                                                className="delete-button"
                                                                title="Eliminar"
                                                                onClick={() =>
                                                                    eliminarMateria(
                                                                        materia.id
                                                                    )
                                                                }
                                                            >
                                                                🗑
                                                            </button>

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

                </div>

            </main>


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
                        className="materia-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >


                        <div className="modal-header">

                            <div>

                                <h2>

                                    {modoEdicion
                                        ? "Editar materia"
                                        : "Nueva materia"}

                                </h2>

                                <p>

                                    {modoEdicion
                                        ? "Modifica los datos de la materia."
                                        : "Registra una nueva materia en el catálogo."}

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


                        {/* FORMULARIO */}

                        <form
                            onSubmit={guardarMateria}
                            className="materia-form"
                        >


                            <div className="form-group">

                                <label>
                                    Clave de la materia *
                                </label>

                                <input
                                    type="text"
                                    name="clave"
                                    value={formulario.clave}
                                    onChange={manejarCambio}
                                    placeholder="Ej. ISC101"
                                    required
                                />

                                <small>
                                    Identificador único de la materia.
                                </small>

                            </div>


                            <div className="form-group">

                                <label>
                                    Nombre de la materia *
                                </label>

                                <input
                                    type="text"
                                    name="nombre"
                                    value={formulario.nombre}
                                    onChange={manejarCambio}
                                    placeholder="Ej. Programación"
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
                                        : "Registrar materia"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Materias;