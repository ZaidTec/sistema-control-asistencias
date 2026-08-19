import { useEffect, useState } from "react";
import { Search, BookOpen, Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";
import ConfirmDialog from "../ui/ConfirmDialog";
import EmptyState from "../ui/EmptyState";
import { useToast } from "../ui/Toast";
import "../../styles/materias.css";

function MateriasTab() {

    const toast = useToast();

    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [busqueda, setBusqueda] = useState("");

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

    const [eliminarId, setEliminarId] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [guardando, setGuardando] = useState(false);

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

        setGuardando(true);

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

            toast(
                "success",
                modoEdicion
                    ? "Materia actualizada correctamente."
                    : "Materia registrada correctamente."
            );

            await cargarMaterias();

        } catch (error) {

            console.error(
                "Error al guardar materia:",
                error
            );

            setError(
                "No se pudo guardar la materia."
            );

        } finally {

            setGuardando(false);

        }

    };


    /* =========================================
       ELIMINAR MATERIA
    ========================================= */

    const confirmarEliminar = async () => {

        if (!eliminarId) {
            return;
        }

        setEliminando(true);

        try {

            await api.delete(
                `/materias/${eliminarId}`
            );

            setEliminarId(null);

            toast("success", "Materia eliminada correctamente.");

            await cargarMaterias();

        } catch (error) {

            console.error(
                "Error al eliminar materia:",
                error
            );

            setError(
                "No se pudo eliminar la materia."
            );

        } finally {

            setEliminando(false);

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
        <div className="materias-tab">

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


            <section className="materias-card">

                <div className="search-container">

                    <span className="search-icon">
                        <Search size={15} />
                    </span>

                    <input
                        type="text"
                        placeholder="Buscar por clave o nombre..."
                        aria-label="Buscar por clave o nombre"
                        value={busqueda}
                        onChange={(e) =>
                            setBusqueda(e.target.value)
                        }
                    />

                </div>


                {error && (

                    <div className="materias-error" role="alert">
                        {error}
                    </div>

                )}


                {loading ? (

                    <div className="materias-loading">
                        Cargando materias...
                    </div>

                ) : materiasFiltradas.length === 0 ? (

                    <EmptyState
                        icon={BookOpen}
                        title="No hay materias registradas"
                        text="Agrega una materia para comenzar."
                    />

                ) : (

                    <div className="materias-table-container">

                        <table className="materias-table">

                            <thead>

                                <tr>

                                    <th scope="col">
                                        #
                                    </th>

                                    <th scope="col">
                                        Clave
                                    </th>

                                    <th scope="col">
                                        Nombre de la materia
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

                                {materiasFiltradas.map(
                                    (materia, index) => (

                                        <tr
                                            key={materia.id}
                                        >

                                            <td className="materia-index-cell">
                                                {index + 1}
                                            </td>


                                            <td data-label="Clave">

                                                <span className="materia-clave">
                                                    {materia.clave}
                                                </span>

                                            </td>


                                            <td data-label="Materia">

                                                <div className="materia-name">

                                                    <div className="materia-icon">
                                                        <BookOpen size={16} />
                                                    </div>

                                                    <strong>
                                                        {materia.nombre}
                                                    </strong>

                                                </div>

                                            </td>


                                            <td data-label="Estado">

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


                                            <td className="materia-actions-cell">

                                                <div className="action-buttons">

                                                    <button
                                                        className="edit-button"
                                                        aria-label={`Editar ${materia.clave}`}
                                                        onClick={() =>
                                                            editarMateria(
                                                                materia
                                                            )
                                                        }
                                                    >
                                                        <Pencil size={14} />
                                                    </button>


                                                    <button
                                                        className="delete-button"
                                                        aria-label={`Eliminar ${materia.clave}`}
                                                        onClick={() =>
                                                            setEliminarId(
                                                                materia.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={14} />
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
                                aria-label="Cerrar"
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={guardarMateria}
                            className="materia-form"
                        >


                            <div className="form-group">

                                <label htmlFor="materia-clave">
                                    Clave de la materia *
                                </label>

                                <input
                                    id="materia-clave"
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

                                <label htmlFor="materia-nombre">
                                    Nombre de la materia *
                                </label>

                                <input
                                    id="materia-nombre"
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

                                    <label htmlFor="materia-estado">
                                        Estado
                                    </label>

                                    <select
                                        id="materia-estado"
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
                                            : "Registrar materia")}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            <ConfirmDialog
                open={eliminarId !== null}
                title="Eliminar materia"
                message="¿Seguro que deseas eliminar esta materia?"
                onCancel={() => setEliminarId(null)}
                onConfirm={confirmarEliminar}
                loading={eliminando}
            />

        </div>
    );

}

export default MateriasTab;