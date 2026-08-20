import { useEffect, useState } from "react";
import {
    Users,
    CalendarDays,
    BookOpen,
    UsersRound,
    Building2,
    Settings,
    Trash2,
    Pencil
} from "lucide-react";
import api from "../services/api";
import Layout from "../components/Layout";
import MateriasTab from "../components/admin/MateriasTab";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import "../styles/administracion.css";

function Administracion() {

    const [seccion, setSeccion] = useState("usuarios");

    const [usuarios, setUsuarios] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [salones, setSalones] = useState([]);

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const [usuarioForm, setUsuarioForm] = useState({
        username: "",
        password: "",
        rol: "usuario"
    });

    const [periodoForm, setPeriodoForm] = useState({
        nombre: "",
        fecha_inicio: "",
        fecha_fin: ""
    });

    const [grupoForm, setGrupoForm] = useState({
        clave: "",
        semestre: ""
    });

    const [salonForm, setSalonForm] = useState({
        numero: ""
    });

    const [salonEdicion, setSalonEdicion] = useState(null);
    const [numeroEdicion, setNumeroEdicion] = useState("");
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);
    const [salonEliminar, setSalonEliminar] = useState(null);

    const [usuarioEdicion, setUsuarioEdicion] = useState(null);
    const [usuarioEditForm, setUsuarioEditForm] = useState({
        username: "",
        rol: "usuario",
        password: ""
    });
    const [guardandoUsuarioEdicion, setGuardandoUsuarioEdicion] = useState(false);

    const [periodoEdicion, setPeriodoEdicion] = useState(null);
    const [periodoEditForm, setPeriodoEditForm] = useState({
        nombre: "",
        fecha_inicio: "",
        fecha_fin: ""
    });
    const [guardandoPeriodoEdicion, setGuardandoPeriodoEdicion] = useState(false);

    const [grupoEdicion, setGrupoEdicion] = useState(null);
    const [grupoEditForm, setGrupoEditForm] = useState({
        clave: "",
        semestre: ""
    });
    const [guardandoGrupoEdicion, setGuardandoGrupoEdicion] = useState(false);

    const [eliminarId, setEliminarId] = useState(null);
    const [eliminando, setEliminando] = useState(false);


    const aFechaLocal = (fecha) => {

        if (!fecha) {
            return "";
        }

        const d = new Date(fecha);

        const mm = String(
            d.getMonth() + 1
        ).padStart(2, "0");

        const dd = String(
            d.getDate()
        ).padStart(2, "0");

        return `${d.getFullYear()}-${mm}-${dd}`;

    };


    /* =========================================
       CARGAR INFORMACIÓN
    ========================================== */

    useEffect(() => {
        cargarInformacion();
    }, []);


    const cargarInformacion = async () => {

        try {

            setError("");

            const resultados = await Promise.allSettled([
                api.get("/usuarios"),
                api.get("/periodos"),
                api.get("/grupos"),
                api.get("/salones")
            ]);

            if (resultados[0].status === "fulfilled") {
                setUsuarios(resultados[0].value.data);
            }

            if (resultados[1].status === "fulfilled") {
                setPeriodos(resultados[1].value.data);
            }

            if (resultados[2].status === "fulfilled") {
                setGrupos(resultados[2].value.data);
            }

            if (resultados[3].status === "fulfilled") {
                setSalones(resultados[3].value.data);
            }

        } catch (err) {

            console.error(err);

            setError(
                "No se pudo cargar la información."
            );

        }

    };


    /* =========================================
       MENSAJES
    ========================================== */

    const mostrarMensaje = (texto) => {

        setMensaje(texto);

        setTimeout(() => {
            setMensaje("");
        }, 3000);

    };


    /* =========================================
       USUARIOS
    ========================================== */

    const cambiarUsuario = (e) => {

        setUsuarioForm({
            ...usuarioForm,
            [e.target.name]: e.target.value
        });

    };


    const crearUsuario = async (e) => {

        e.preventDefault();

        setError("");

        if (
            !usuarioForm.username ||
            !usuarioForm.password
        ) {

            setError(
                "Debes completar usuario y contraseña."
            );

            return;

        }

        try {

            await api.post(
                "/usuarios",
                {
                    username: usuarioForm.username,
                    password: usuarioForm.password,
                    rol: usuarioForm.rol,
                    activo: true
                }
            );

            setUsuarioForm({
                username: "",
                password: "",
                rol: "usuario"
            });

            mostrarMensaje(
                "Usuario creado correctamente."
            );

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo crear el usuario."
            );

        }

    };


    const cambiarEstadoUsuario = async (
        usuario
    ) => {

        try {

            await api.put(
                `/usuarios/${usuario.id}`,
                {
                    activo: !usuario.activo
                }
            );

            mostrarMensaje(
                "Estado del usuario actualizado."
            );

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                "No se pudo actualizar el usuario."
            );

        }

    };


    const confirmarEliminar = async () => {

        if (!eliminarId) {
            return;
        }

        setEliminando(true);

        try {

            await api.delete(
                `/usuarios/${eliminarId}`
            );

            setEliminarId(null);

            mostrarMensaje(
                "Usuario eliminado correctamente."
            );

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo eliminar el usuario."
            );

        } finally {

            setEliminando(false);

        }

    };


    /* =========================================
       EDITAR USUARIO
    ========================================== */

    const abrirEdicionUsuario = (
        usuario
    ) => {

        setError("");

        setUsuarioEdicion(usuario);

        setUsuarioEditForm({
            username: usuario.username,
            rol: usuario.rol === "ADMINISTRADOR"
                ? "administrador"
                : "usuario",
            password: ""
        });

    };


    const cambiarUsuarioEdicion = (e) => {

        setUsuarioEditForm({
            ...usuarioEditForm,
            [e.target.name]: e.target.value
        });

    };


    const guardarEdicionUsuario = async (e) => {

        e.preventDefault();

        if (!usuarioEdicion) {
            return;
        }

        if (!usuarioEditForm.username.trim()) {

            setError(
                "Escribe el nombre de usuario."
            );

            return;

        }

        setGuardandoUsuarioEdicion(true);

        try {

            const body = {
                username: usuarioEditForm.username.trim(),
                rol: usuarioEditForm.rol
            };

            if (usuarioEditForm.password) {
                body.password = usuarioEditForm.password;
            }

            await api.put(
                `/usuarios/${usuarioEdicion.id}`,
                body
            );

            mostrarMensaje(
                "Usuario actualizado correctamente."
            );

            setUsuarioEdicion(null);

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo actualizar el usuario."
            );

        } finally {

            setGuardandoUsuarioEdicion(false);

        }

    };


    /* =========================================
       EDITAR PERIODO
    ========================================== */

    const abrirEdicionPeriodo = (
        periodo
    ) => {

        setError("");

        setPeriodoEdicion(periodo);

        setPeriodoEditForm({
            nombre: periodo.nombre,
            fecha_inicio: aFechaLocal(
                periodo.fecha_inicio
            ),
            fecha_fin: aFechaLocal(
                periodo.fecha_fin
            )
        });

    };


    const cambiarPeriodoEdicion = (e) => {

        setPeriodoEditForm({
            ...periodoEditForm,
            [e.target.name]: e.target.value
        });

    };


    const guardarEdicionPeriodo = async (e) => {

        e.preventDefault();

        if (!periodoEdicion) {
            return;
        }

        if (
            !periodoEditForm.nombre ||
            !periodoEditForm.fecha_inicio ||
            !periodoEditForm.fecha_fin
        ) {

            setError(
                "Completa nombre y fechas del periodo."
            );

            return;

        }

        if (
            periodoEditForm.fecha_inicio >=
            periodoEditForm.fecha_fin
        ) {

            setError(
                "La fecha inicial debe ser menor a la fecha final."
            );

            return;

        }

        setGuardandoPeriodoEdicion(true);

        try {

            await api.put(
                `/periodos/${periodoEdicion.id}`,
                {
                    nombre: periodoEditForm.nombre,
                    fecha_inicio: periodoEditForm.fecha_inicio,
                    fecha_fin: periodoEditForm.fecha_fin
                }
            );

            mostrarMensaje(
                "Periodo actualizado correctamente."
            );

            setPeriodoEdicion(null);

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo actualizar el periodo."
            );

        } finally {

            setGuardandoPeriodoEdicion(false);

        }

    };


    /* =========================================
       EDITAR GRUPO
    ========================================== */

    const abrirEdicionGrupo = (
        grupo
    ) => {

        setError("");

        setGrupoEdicion(grupo);

        setGrupoEditForm({
            clave: grupo.clave,
            semestre: grupo.semestre
        });

    };


    const cambiarGrupoEdicion = (e) => {

        setGrupoEditForm({
            ...grupoEditForm,
            [e.target.name]: e.target.value
        });

    };


    const guardarEdicionGrupo = async (e) => {

        e.preventDefault();

        if (!grupoEdicion) {
            return;
        }

        if (
            !grupoEditForm.clave ||
            !grupoEditForm.semestre
        ) {

            setError(
                "Completa la clave y semestre del grupo."
            );

            return;

        }

        setGuardandoGrupoEdicion(true);

        try {

            await api.put(
                `/grupos/${grupoEdicion.id}`,
                {
                    clave: grupoEditForm.clave,
                    semestre:
                        Number(grupoEditForm.semestre)
                }
            );

            mostrarMensaje(
                "Grupo actualizado correctamente."
            );

            setGrupoEdicion(null);

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo actualizar el grupo."
            );

        } finally {

            setGuardandoGrupoEdicion(false);

        }

    };


    /* =========================================
       PERIODOS
    ========================================== */

    const cambiarPeriodo = (e) => {

        setPeriodoForm({
            ...periodoForm,
            [e.target.name]: e.target.value
        });

    };


    const crearPeriodo = async (e) => {

        e.preventDefault();

        setError("");

        if (
            !periodoForm.nombre ||
            !periodoForm.fecha_inicio ||
            !periodoForm.fecha_fin
        ) {

            setError(
                "Completa todos los datos del periodo."
            );

            return;

        }


        if (
            periodoForm.fecha_inicio >=
            periodoForm.fecha_fin
        ) {

            setError(
                "La fecha inicial debe ser menor a la fecha final."
            );

            return;

        }


        try {

            await api.post(
                "/periodos",
                {
                    nombre: periodoForm.nombre,
                    fecha_inicio:
                        periodoForm.fecha_inicio,
                    fecha_fin:
                        periodoForm.fecha_fin,
                    activo: true
                }
            );

            setPeriodoForm({
                nombre: "",
                fecha_inicio: "",
                fecha_fin: ""
            });

            mostrarMensaje(
                "Periodo creado correctamente."
            );

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo crear el periodo."
            );

        }

    };


    /* =========================================
       GRUPOS
    ========================================== */

    const cambiarGrupo = (e) => {

        setGrupoForm({
            ...grupoForm,
            [e.target.name]: e.target.value
        });

    };


    const crearGrupo = async (e) => {

        e.preventDefault();

        setError("");

        if (
            !grupoForm.clave ||
            !grupoForm.semestre
        ) {

            setError(
                "Completa la clave y semestre del grupo."
            );

            return;

        }


        try {

            await api.post(
                "/grupos",
                {
                    clave: grupoForm.clave,
                    semestre:
                        Number(grupoForm.semestre),
                    activo: true
                }
            );

            setGrupoForm({
                clave: "",
                semestre: ""
            });

            mostrarMensaje(
                "Grupo creado correctamente."
            );

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo crear el grupo."
            );

        }

    };


    /* =========================================
       SALONES
    ========================================== */

    const cambiarEstadoSalon = async (
        salon
    ) => {

        try {

            await api.put(
                `/salones/${salon.id}`,
                {
                    activo:
                        salon.activo === undefined
                            ? false
                            : !salon.activo
                }
            );

            mostrarMensaje(
                "Estado del salón actualizado."
            );

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                "No se pudo actualizar el salón."
            );

        }

    };


    const cambiarSalon = (e) => {

        setSalonForm({
            ...salonForm,
            [e.target.name]: e.target.value
        });

    };


    const crearSalon = async (e) => {

        e.preventDefault();

        setError("");

        if (!salonForm.numero.trim()) {

            setError(
                "Escribe el número del salón."
            );

            return;

        }


        try {

            await api.post(
                "/salones",
                {
                    numero: salonForm.numero.trim()
                }
            );

            setSalonForm({
                numero: ""
            });

            mostrarMensaje(
                "Salón creado correctamente."
            );

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo crear el salón."
            );

        }

    };


    const abrirEdicionSalon = (
        salon
    ) => {

        setError("");

        setSalonEdicion(salon);

        setNumeroEdicion(salon.numero);

    };


    const guardarEdicionSalon = async (e) => {

        e.preventDefault();

        if (!salonEdicion) {

            return;

        }

        if (!numeroEdicion.trim()) {

            setError(
                "Escribe el número del salón."
            );

            return;

        }

        setGuardandoEdicion(true);

        try {

            await api.put(
                `/salones/${salonEdicion.id}`,
                {
                    numero: numeroEdicion.trim()
                }
            );

            mostrarMensaje(
                "Salón actualizado correctamente."
            );

            setSalonEdicion(null);

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo actualizar el salón."
            );

        } finally {

            setGuardandoEdicion(false);

        }

    };


    const confirmarEliminarSalon = async () => {

        if (!salonEliminar) {

            return;

        }

        setEliminando(true);

        try {

            await api.delete(
                `/salones/${salonEliminar.id}`
            );

            mostrarMensaje(
                "Salón eliminado correctamente."
            );

            setSalonEliminar(null);

            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo eliminar el salón."
            );

            setSalonEliminar(null);

        } finally {

            setEliminando(false);

        }

    };


    return (

        <Layout titulo="Administración y Configuración">

            <section className="page-title">

                <h2>
                    Administración del sistema
                </h2>

                <p>
                    Gestiona usuarios, periodos,
                    grupos y salones.
                </p>

            </section>


                    {error && (

                        <div className="admin-error" role="alert">
                            {error}
                        </div>

                    )}


                    {mensaje && (

                        <div className="admin-success" role="status">
                            {mensaje}
                        </div>

                    )}


                    <div className="admin-layout">


                        {/* =====================================
                            TABS CONFIGURACIÓN
                        ====================================== */}

                        <nav className="admin-tabs">

                            <button
                                className={
                                    seccion === "usuarios"
                                        ? "admin-tab active"
                                        : "admin-tab"
                                }
                                onClick={() =>
                                    setSeccion("usuarios")
                                }
                            >
                                <Users size={16} />
                                Usuarios
                            </button>


                            <button
                                className={
                                    seccion === "periodos"
                                        ? "admin-tab active"
                                        : "admin-tab"
                                }
                                onClick={() =>
                                    setSeccion("periodos")
                                }
                            >
                                <CalendarDays size={16} />
                                Periodos escolares
                            </button>


                            <button
                                className={
                                    seccion === "materias"
                                        ? "admin-tab active"
                                        : "admin-tab"
                                }
                                onClick={() =>
                                    setSeccion("materias")
                                }
                            >
                                <BookOpen size={16} />
                                Materias
                            </button>


                            <button
                                className={
                                    seccion === "grupos"
                                        ? "admin-tab active"
                                        : "admin-tab"
                                }
                                onClick={() =>
                                    setSeccion("grupos")
                                }
                            >
                                <UsersRound size={16} />
                                Grupos
                            </button>


                            <button
                                className={
                                    seccion === "salones"
                                        ? "admin-tab active"
                                        : "admin-tab"
                                }
                                onClick={() =>
                                    setSeccion("salones")
                                }
                            >
                                <Building2 size={16} />
                                Salones
                            </button>


                            <button
                                className={
                                    seccion === "general"
                                        ? "admin-tab active"
                                        : "admin-tab"
                                }
                                onClick={() =>
                                    setSeccion("general")
                                }
                            >
                                <Settings size={16} />
                                Configuración
                            </button>

                        </nav>


                        {/* =====================================
                            PANEL
                        ====================================== */}

                        <section className="settings-panel">


                            {/* =================================
                                USUARIOS
                            ================================== */}

                            {seccion === "usuarios" && (

                                <>

                                    <div className="panel-header">

                                        <div>
                                            <h3>
                                                Usuarios del sistema
                                            </h3>

                                            <p>
                                                Administra las cuentas
                                                que pueden iniciar sesión
                                                y registrar asistencias.
                                            </p>
                                        </div>

                                    </div>


                                    <form
                                        className="admin-form"
                                        onSubmit={
                                            crearUsuario
                                        }
                                    >

                                        <div className="form-group">

                                            <label htmlFor="usuario-username">
                                                Nombre de usuario
                                            </label>

                                            <input
                                                id="usuario-username"
                                                type="text"
                                                name="username"
                                                value={
                                                    usuarioForm.username
                                                }
                                                onChange={
                                                    cambiarUsuario
                                                }
                                                placeholder="Ej. usuario01"
                                            />

                                        </div>


                                        <div className="form-group">

                                            <label htmlFor="usuario-password">
                                                Contraseña
                                            </label>

                                            <input
                                                id="usuario-password"
                                                type="password"
                                                name="password"
                                                value={
                                                    usuarioForm.password
                                                }
                                                onChange={
                                                    cambiarUsuario
                                                }
                                                placeholder="Contraseña"
                                            />

                                        </div>


                                        <div className="form-group">

                                            <label htmlFor="usuario-rol">
                                                Rol
                                            </label>

                                            <select
                                                id="usuario-rol"
                                                name="rol"
                                                value={
                                                    usuarioForm.rol
                                                }
                                                onChange={
                                                    cambiarUsuario
                                                }
                                            >

                                                <option value="usuario">
                                                    Usuario
                                                </option>

                                                <option value="administrador">
                                                    Administrador
                                                </option>

                                            </select>

                                        </div>


                                        <button
                                            className="primary-button"
                                            type="submit"
                                        >
                                            + Crear usuario
                                        </button>

                                    </form>


                                    <div className="data-table-container">

                                        <table className="admin-table">

                                            <thead>

                                                <tr>

                                                    <th scope="col">
                                                        Usuario
                                                    </th>

                                                    <th scope="col">
                                                        Rol
                                                    </th>

                                                    <th scope="col">
                                                        Estado
                                                    </th>

                                                    <th scope="col">
                                                        Acción
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {usuarios.length === 0 ? (

                                                    <tr>

                                                        <td
                                                            colSpan="4"
                                                            className="empty-table"
                                                        >
                                                            No hay usuarios
                                                            registrados.
                                                        </td>

                                                    </tr>

                                                ) : (

                                                    usuarios.map(
                                                        usuario => (

                                                            <tr
                                                                key={
                                                                    usuario.id
                                                                }
                                                            >

                                                                <td data-label="Usuario">
                                                                    {
                                                                        usuario.username
                                                                    }
                                                                </td>

                                                                <td data-label="Rol">

                                                                    <span className="role-badge">

                                                                        {
                                                                            usuario.rol
                                                                        }

                                                                    </span>

                                                                </td>

                                                                <td data-label="Estado">

                                                                    <span
                                                                        className={
                                                                            usuario.activo
                                                                                ? "status active"
                                                                                : "status inactive"
                                                                        }
                                                                    >

                                                                        {
                                                                            usuario.activo
                                                                                ? "Activo"
                                                                                : "Inactivo"
                                                                        }

                                                                    </span>

                                                                </td>

                                                                <td className="admin-actions-cell">

                                                                    <div className="admin-actions">

                                                                        <button
                                                                            className="secondary-button"
                                                                            onClick={() =>
                                                                                cambiarEstadoUsuario(
                                                                                    usuario
                                                                                )
                                                                            }
                                                                        >

                                                                            {usuario.activo
                                                                                ? "Desactivar"
                                                                                : "Activar"}

                                                                        </button>


                                                                        <button
                                                                            className="icon-button edit-button"
                                                                            title="Editar usuario"
                                                                            aria-label={`Editar usuario ${usuario.username}`}
                                                                            onClick={() =>
                                                                                abrirEdicionUsuario(
                                                                                    usuario
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil size={14} />
                                                                        </button>


                                                                        <button
                                                                            className="icon-button delete-button"
                                                                            title="Eliminar usuario"
                                                                            aria-label={`Eliminar usuario ${usuario.username}`}
                                                                            onClick={() =>
                                                                                setEliminarId(
                                                                                    usuario.id
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>

                                                                    </div>

                                                                </td>

                                                            </tr>

                                                        )
                                                    )

                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                    <ConfirmDialog
                                        open={eliminarId !== null}
                                        title="Eliminar usuario"
                                        message="¿Seguro que deseas eliminar este usuario? Esta acción es permanente y no se puede deshacer."
                                        confirmLabel="Eliminar"
                                        cancelLabel="Cancelar"
                                        onCancel={() =>
                                            setEliminarId(null)
                                        }
                                        onConfirm={confirmarEliminar}
                                        loading={eliminando}
                                    />


                                    <Modal
                                        open={usuarioEdicion !== null}
                                        onClose={() =>
                                            setUsuarioEdicion(null)
                                        }
                                        title="Editar usuario"
                                        description="Modifica los datos de la cuenta."
                                    >

                                        <form
                                            onSubmit={
                                                guardarEdicionUsuario
                                            }
                                        >

                                            <div className="form-group">

                                                <label htmlFor="usuario-edit-username">
                                                    Nombre de usuario
                                                </label>

                                                <input
                                                    id="usuario-edit-username"
                                                    type="text"
                                                    name="username"
                                                    value={
                                                        usuarioEditForm.username
                                                    }
                                                    onChange={
                                                        cambiarUsuarioEdicion
                                                    }
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label htmlFor="usuario-edit-rol">
                                                    Rol
                                                </label>

                                                <select
                                                    id="usuario-edit-rol"
                                                    name="rol"
                                                    value={
                                                        usuarioEditForm.rol
                                                    }
                                                    onChange={
                                                        cambiarUsuarioEdicion
                                                    }
                                                >

                                                    <option value="usuario">
                                                        Usuario
                                                    </option>

                                                    <option value="administrador">
                                                        Administrador
                                                    </option>

                                                </select>

                                            </div>


                                            <div className="form-group">

                                                <label htmlFor="usuario-edit-password">
                                                    Nueva contraseña
                                                </label>

                                                <input
                                                    id="usuario-edit-password"
                                                    type="password"
                                                    name="password"
                                                    value={
                                                        usuarioEditForm.password
                                                    }
                                                    onChange={
                                                        cambiarUsuarioEdicion
                                                    }
                                                    placeholder="Déjalo vacío para no cambiar"
                                                    autoComplete="new-password"
                                                />

                                            </div>


                                            <div className="modal-actions">

                                                <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                        setUsuarioEdicion(
                                                            null
                                                        )
                                                    }
                                                >
                                                    Cancelar
                                                </button>


                                                <button
                                                    className="primary-button"
                                                    type="submit"
                                                    disabled={
                                                        guardandoUsuarioEdicion
                                                    }
                                                >
                                                    {guardandoUsuarioEdicion
                                                        ? "Guardando..."
                                                        : "Guardar"}
                                                </button>

                                            </div>

                                        </form>

                                    </Modal>

                                </>

                            )}


                            {/* =================================
                                PERIODOS
                            ================================== */}

                            {seccion === "periodos" && (

                                <>

                                    <div className="panel-header">

                                        <div>

                                            <h3>
                                                Periodos escolares
                                            </h3>

                                            <p>
                                                Administra los semestres
                                                del sistema.
                                            </p>

                                        </div>

                                    </div>


                                    <form
                                        className="admin-form"
                                        onSubmit={
                                            crearPeriodo
                                        }
                                    >

                                        <div className="form-group">

                                            <label htmlFor="periodo-nombre">
                                                Nombre del periodo
                                            </label>

                                            <input
                                                id="periodo-nombre"
                                                type="text"
                                                name="nombre"
                                                value={
                                                    periodoForm.nombre
                                                }
                                                onChange={
                                                    cambiarPeriodo
                                                }
                                                placeholder="Ej. Enero-Julio 2027"
                                            />

                                        </div>


                                        <div className="form-group">

                                            <label htmlFor="periodo-fecha-inicio">
                                                Fecha de inicio
                                            </label>

                                            <input
                                                id="periodo-fecha-inicio"
                                                type="date"
                                                name="fecha_inicio"
                                                value={
                                                    periodoForm.fecha_inicio
                                                }
                                                onChange={
                                                    cambiarPeriodo
                                                }
                                            />

                                        </div>


                                        <div className="form-group">

                                            <label htmlFor="periodo-fecha-fin">
                                                Fecha final
                                            </label>

                                            <input
                                                id="periodo-fecha-fin"
                                                type="date"
                                                name="fecha_fin"
                                                value={
                                                    periodoForm.fecha_fin
                                                }
                                                onChange={
                                                    cambiarPeriodo
                                                }
                                            />

                                        </div>


                                        <button
                                            className="primary-button"
                                            type="submit"
                                        >
                                            + Crear periodo
                                        </button>

                                    </form>


                                    <div className="data-table-container">

                                        <table className="admin-table">

                                            <thead>

                                                <tr>

                                                    <th scope="col">
                                                        Periodo
                                                    </th>

                                                    <th scope="col">
                                                        Inicio
                                                    </th>

                                                    <th scope="col">
                                                        Fin
                                                    </th>

                                                    <th scope="col">
                                                        Estado
                                                    </th>

                                                    <th scope="col">
                                                        Acción
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {periodos.length === 0 ? (

                                                    <tr>

                                                        <td
                                                            colSpan="5"
                                                            className="empty-table"
                                                        >
                                                            No hay periodos.
                                                        </td>

                                                    </tr>

                                                ) : (

                                                    periodos.map(
                                                        periodo => (

                                                            <tr
                                                                key={
                                                                    periodo.id
                                                                }
                                                            >

                                                                <td data-label="Periodo">
                                                                    {
                                                                        periodo.nombre
                                                                    }
                                                                </td>

                                                                <td data-label="Inicio">
                                                                    {
                                                                        periodo.fecha_inicio
                                                                    }
                                                                </td>

                                                                <td data-label="Fin">
                                                                    {
                                                                        periodo.fecha_fin
                                                                    }
                                                                </td>

                                                                <td data-label="Estado">

                                                                    <span
                                                                        className={
                                                                            periodo.activo
                                                                                ? "status active"
                                                                                : "status inactive"
                                                                        }
                                                                    >
                                                                        {
                                                                            periodo.activo
                                                                                ? "Activo"
                                                                                : "Inactivo"
                                                                        }
                                                                    </span>

                                                                </td>

                                                                <td className="admin-actions-cell">

                                                                    <div className="admin-actions">

                                                                        <button
                                                                            className="icon-button edit-button"
                                                                            title="Editar periodo"
                                                                            aria-label={`Editar periodo ${periodo.nombre}`}
                                                                            onClick={() =>
                                                                                abrirEdicionPeriodo(
                                                                                    periodo
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil size={14} />
                                                                        </button>

                                                                    </div>

                                                                </td>

                                                            </tr>

                                                        )
                                                    )

                                                )}

                                            </tbody>

                                        </table>

                                    </div>


                                    <Modal
                                        open={periodoEdicion !== null}
                                        onClose={() =>
                                            setPeriodoEdicion(null)
                                        }
                                        title="Editar periodo"
                                        description="Modifica los datos del periodo escolar."
                                    >

                                        <form
                                            onSubmit={
                                                guardarEdicionPeriodo
                                            }
                                        >

                                            <div className="form-group">

                                                <label htmlFor="periodo-edit-nombre">
                                                    Nombre del periodo
                                                </label>

                                                <input
                                                    id="periodo-edit-nombre"
                                                    type="text"
                                                    name="nombre"
                                                    value={
                                                        periodoEditForm.nombre
                                                    }
                                                    onChange={
                                                        cambiarPeriodoEdicion
                                                    }
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label htmlFor="periodo-edit-fecha-inicio">
                                                    Fecha de inicio
                                                </label>

                                                <input
                                                    id="periodo-edit-fecha-inicio"
                                                    type="date"
                                                    name="fecha_inicio"
                                                    value={
                                                        periodoEditForm.fecha_inicio
                                                    }
                                                    onChange={
                                                        cambiarPeriodoEdicion
                                                    }
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label htmlFor="periodo-edit-fecha-fin">
                                                    Fecha final
                                                </label>

                                                <input
                                                    id="periodo-edit-fecha-fin"
                                                    type="date"
                                                    name="fecha_fin"
                                                    value={
                                                        periodoEditForm.fecha_fin
                                                    }
                                                    onChange={
                                                        cambiarPeriodoEdicion
                                                    }
                                                />

                                            </div>


                                            <div className="modal-actions">

                                                <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                        setPeriodoEdicion(
                                                            null
                                                        )
                                                    }
                                                >
                                                    Cancelar
                                                </button>


                                                <button
                                                    className="primary-button"
                                                    type="submit"
                                                    disabled={
                                                        guardandoPeriodoEdicion
                                                    }
                                                >
                                                    {guardandoPeriodoEdicion
                                                        ? "Guardando..."
                                                        : "Guardar"}
                                                </button>

                                            </div>

                                        </form>

                                    </Modal>

                                </>

                            )}


                            {/* =================================
                                MATERIAS
                            ================================== */}

                            {seccion === "materias" && (

                                <MateriasTab />

                            )}


                            {/* =================================
                                GRUPOS
                            ================================== */}

                            {seccion === "grupos" && (

                                <>

                                    <div className="panel-header">

                                        <div>

                                            <h3>
                                                Grupos
                                            </h3>

                                            <p>
                                                Registra los grupos
                                                correspondientes a cada
                                                semestre.
                                            </p>

                                        </div>

                                    </div>


                                    <form
                                        className="admin-form"
                                        onSubmit={
                                            crearGrupo
                                        }
                                    >

                                        <div className="form-group">

                                            <label htmlFor="grupo-clave">
                                                Clave del grupo
                                            </label>

                                            <input
                                                id="grupo-clave"
                                                type="text"
                                                name="clave"
                                                value={
                                                    grupoForm.clave
                                                }
                                                onChange={
                                                    cambiarGrupo
                                                }
                                                placeholder="Ej. S8A"
                                            />

                                        </div>


                                        <div className="form-group">

                                            <label htmlFor="grupo-semestre">
                                                Semestre
                                            </label>

                                            <input
                                                id="grupo-semestre"
                                                type="number"
                                                name="semestre"
                                                min="1"
                                                max="12"
                                                value={
                                                    grupoForm.semestre
                                                }
                                                onChange={
                                                    cambiarGrupo
                                                }
                                                placeholder="Ej. 8"
                                            />

                                        </div>


                                        <button
                                            className="primary-button"
                                            type="submit"
                                        >
                                            + Crear grupo
                                        </button>

                                    </form>


                                    <div className="data-table-container">

                                        <table className="admin-table">

                                            <thead>

                                                <tr>

                                                    <th scope="col">
                                                        Grupo
                                                    </th>

                                                    <th scope="col">
                                                        Semestre
                                                    </th>

                                                    <th scope="col">
                                                        Estado
                                                    </th>

                                                    <th scope="col">
                                                        Acción
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {grupos.length === 0 ? (

                                                    <tr>

                                                        <td
                                                            colSpan="4"
                                                            className="empty-table"
                                                        >
                                                            No hay grupos
                                                            registrados.
                                                        </td>

                                                    </tr>

                                                ) : (

                                                    grupos.map(
                                                        grupo => (

                                                            <tr
                                                                key={
                                                                    grupo.id
                                                                }
                                                            >

                                                                <td data-label="Grupo">
                                                                    {
                                                                        grupo.clave
                                                                    }
                                                                </td>

                                                                <td data-label="Semestre">
                                                                    {
                                                                        grupo.semestre
                                                                    }
                                                                </td>

                                                                <td data-label="Estado">

                                                                    <span
                                                                        className={
                                                                            grupo.activo
                                                                                ? "status active"
                                                                                : "status inactive"
                                                                        }
                                                                    >

                                                                        {
                                                                            grupo.activo
                                                                                ? "Activo"
                                                                                : "Inactivo"
                                                                        }

                                                                    </span>

                                                                </td>

                                                                <td className="admin-actions-cell">

                                                                    <div className="admin-actions">

                                                                        <button
                                                                            className="icon-button edit-button"
                                                                            title="Editar grupo"
                                                                            aria-label={`Editar grupo ${grupo.clave}`}
                                                                            onClick={() =>
                                                                                abrirEdicionGrupo(
                                                                                    grupo
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil size={14} />
                                                                        </button>

                                                                    </div>

                                                                </td>

                                                            </tr>

                                                        )
                                                    )

                                                )}

                                            </tbody>

                                        </table>

                                    </div>


                                    <Modal
                                        open={grupoEdicion !== null}
                                        onClose={() =>
                                            setGrupoEdicion(null)
                                        }
                                        title="Editar grupo"
                                        description="Modifica los datos del grupo."
                                    >

                                        <form
                                            onSubmit={
                                                guardarEdicionGrupo
                                            }
                                        >

                                            <div className="form-group">

                                                <label htmlFor="grupo-edit-clave">
                                                    Clave del grupo
                                                </label>

                                                <input
                                                    id="grupo-edit-clave"
                                                    type="text"
                                                    name="clave"
                                                    value={
                                                        grupoEditForm.clave
                                                    }
                                                    onChange={
                                                        cambiarGrupoEdicion
                                                    }
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label htmlFor="grupo-edit-semestre">
                                                    Semestre
                                                </label>

                                                <input
                                                    id="grupo-edit-semestre"
                                                    type="number"
                                                    name="semestre"
                                                    min="1"
                                                    max="12"
                                                    value={
                                                        grupoEditForm.semestre
                                                    }
                                                    onChange={
                                                        cambiarGrupoEdicion
                                                    }
                                                />

                                            </div>


                                            <div className="modal-actions">

                                                <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                        setGrupoEdicion(
                                                            null
                                                        )
                                                    }
                                                >
                                                    Cancelar
                                                </button>


                                                <button
                                                    className="primary-button"
                                                    type="submit"
                                                    disabled={
                                                        guardandoGrupoEdicion
                                                    }
                                                >
                                                    {guardandoGrupoEdicion
                                                        ? "Guardando..."
                                                        : "Guardar"}
                                                </button>

                                            </div>

                                        </form>

                                    </Modal>

                                </>

                            )}


                            {/* =================================
                                SALONES
                            ================================== */}

                            {seccion === "salones" && (

                                <>

                                    <div className="panel-header">

                                        <div>

                                            <h3>
                                                Salones
                                            </h3>

                                            <p>
                                                El sistema cuenta con
                                                salones numerados del
                                                1 al 45.
                                            </p>

                                        </div>

                                    </div>


                                    <form
                                        className="admin-form"
                                        onSubmit={crearSalon}
                                    >

                                        <div className="form-group">

                                            <label htmlFor="salon-numero">
                                                Número del salón
                                            </label>

                                            <input
                                                id="salon-numero"
                                                type="text"
                                                name="numero"
                                                maxLength="10"
                                                value={
                                                    salonForm.numero
                                                }
                                                onChange={
                                                    cambiarSalon
                                                }
                                                placeholder="Ej. 12"
                                            />

                                        </div>


                                        <button
                                            className="primary-button"
                                            type="submit"
                                        >
                                            + Crear salón
                                        </button>

                                    </form>


                                    <div className="rooms-grid">

                                        {salones.length === 0
                                            ? (
                                                <EmptyState
                                                    icon={Building2}
                                                    title="No hay salones registrados"
                                                    text="Agrega salones para poder asignarlos en los horarios."
                                                />
                                            )
                                            : salones.map(
                                                salon => (

                                                    <div
                                                        className="room-card"
                                                        key={
                                                            salon.id
                                                        }
                                                    >

                                                        <div className="room-number">
                                                            {
                                                                salon.numero
                                                            }
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                Salón {
                                                                    salon.numero
                                                                }
                                                            </strong>

                                                            <span
                                                                className={
                                                                    salon.activo === false
                                                                        ? "status inactive"
                                                                        : "status active"
                                                                }
                                                            >
                                                                {
                                                                    salon.activo === false
                                                                        ? "Inactivo"
                                                                        : "Activo"
                                                                }
                                                            </span>

                                                        </div>

                                                        {salon.activo !== undefined && (

                                                            <button
                                                                className="room-action"
                                                                onClick={() =>
                                                                    cambiarEstadoSalon(
                                                                        salon
                                                                    )
                                                                }
                                                            >
                                                                {salon.activo
                                                                    ? "Desactivar"
                                                                    : "Activar"}
                                                            </button>

                                                        )}


                                                        <div className="room-actions">

                                                            <button
                                                                className="icon-button edit-button"
                                                                onClick={() =>
                                                                    abrirEdicionSalon(
                                                                        salon
                                                                    )
                                                                }
                                                                title="Editar salón"
                                                                aria-label={`Editar salón ${salon.numero}`}
                                                            >
                                                                <Pencil size={16} />
                                                            </button>


                                                            <button
                                                                className="icon-button delete-button"
                                                                onClick={() =>
                                                                    setSalonEliminar(
                                                                        salon
                                                                    )
                                                                }
                                                                title="Eliminar salón"
                                                                aria-label={`Eliminar salón ${salon.numero}`}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>

                                                        </div>

                                                    </div>

                                                )
                                            )
                                        }

                                    </div>


                                    <Modal
                                        open={salonEdicion !== null}
                                        onClose={() =>
                                            setSalonEdicion(null)
                                        }
                                        title="Editar salón"
                                        description="Actualiza el número del salón."
                                    >

                                        <form
                                            onSubmit={
                                                guardarEdicionSalon
                                            }
                                        >

                                            <div className="form-group">

                                                <label htmlFor="salon-edit-numero">
                                                    Número del salón
                                                </label>

                                                <input
                                                    id="salon-edit-numero"
                                                    type="text"
                                                    name="numero"
                                                    maxLength="10"
                                                    value={
                                                        numeroEdicion
                                                    }
                                                    onChange={(e) =>
                                                        setNumeroEdicion(
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </div>


                                            <div className="modal-actions">

                                                <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                        setSalonEdicion(
                                                            null
                                                        )
                                                    }
                                                >
                                                    Cancelar
                                                </button>


                                                <button
                                                    className="primary-button"
                                                    type="submit"
                                                    disabled={
                                                        guardandoEdicion
                                                    }
                                                >
                                                    {guardandoEdicion
                                                        ? "Guardando..."
                                                        : "Guardar"}
                                                </button>

                                            </div>

                                        </form>

                                    </Modal>


                                    <ConfirmDialog
                                        open={salonEliminar !== null}
                                        title="Eliminar salón"
                                        message="¿Seguro que deseas eliminar este salón? Esta acción es permanente y no se puede deshacer."
                                        confirmLabel="Eliminar"
                                        cancelLabel="Cancelar"
                                        onCancel={() =>
                                            setSalonEliminar(null)
                                        }
                                        onConfirm={confirmarEliminarSalon}
                                        loading={eliminando}
                                    />

                                </>

                            )}


                            {/* =================================
                                CONFIGURACIÓN GENERAL
                            ================================== */}

                            {seccion === "general" && (

                                <>

                                    <div className="panel-header">

                                        <div>

                                            <h3>
                                                Configuración general
                                            </h3>

                                            <p>
                                                Parámetros generales
                                                del sistema.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="configuration-list">

                                        <div className="configuration-item">

                                            <div>

                                                <strong>
                                                    Estados de asistencia
                                                </strong>

                                                <span>
                                                    Presente, Ausente
                                                    y Retardo.
                                                </span>

                                            </div>

                                            <span className="configuration-value">
                                                3 estados
                                            </span>

                                        </div>


                                        <div className="configuration-item">

                                            <div>

                                                <strong>
                                                    Registro de asistencia
                                                </strong>

                                                <span>
                                                    La asistencia se registra
                                                    por cada clase.
                                                </span>

                                            </div>

                                            <span className="configuration-value">
                                                Por clase
                                            </span>

                                        </div>


                                        <div className="configuration-item">

                                            <div>

                                                <strong>
                                                    Periodos escolares
                                                </strong>

                                                <span>
                                                    Enero-Julio y
                                                    Agosto-Diciembre.
                                                </span>

                                            </div>

                                            <span className="configuration-value">
                                                Semestral
                                            </span>

                                        </div>


                                        <div className="configuration-item">

                                            <div>

                                                <strong>
                                                    Salones
                                                </strong>

                                                <span>
                                                    Catálogo de salones
                                                    disponibles.
                                                </span>

                                            </div>

                                            <span className="configuration-value">
                                                1 - 45
                                            </span>

                                        </div>


                                        <div className="configuration-item">

                                            <div>

                                                <strong>
                                                    Observaciones
                                                </strong>

                                                <span>
                                                    Se pueden registrar
                                                    cuando corresponda
                                                    según el estado.
                                                </span>

                                            </div>

                                            <span className="configuration-value">
                                                Activadas
                                            </span>

                                        </div>

                                    </div>


                                    <div className="configuration-note">

                                        <strong>
                                            Importante
                                        </strong>

                                        <p>
                                            Estas opciones representan
                                            la configuración definida
                                            actualmente para el sistema.
                                            Las reglas de negocio deben
                                            validarse también desde
                                            el backend.
                                        </p>

                                    </div>

                                </>

                            )}

                        </section>

                    </div>

        </Layout>

    );

}

export default Administracion;