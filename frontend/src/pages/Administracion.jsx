import { useEffect, useState } from "react";
import {
    Users,
    CalendarDays,
    BookOpen,
    UsersRound,
    Building2,
    Settings,
    Pencil,
    Trash2
} from "lucide-react";
import api from "../services/api";
import Layout from "../components/Layout";
import MateriasTab from "../components/admin/MateriasTab";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
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

    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [usuarioEliminando, setUsuarioEliminando] = useState(null);
    const [eliminandoUsuario, setEliminandoUsuario] = useState(false);
    const [usuarioEditForm, setUsuarioEditForm] = useState({
        username: "",
        password: "",
        rol: "USUARIO"
    });

    const [periodoEditando, setPeriodoEditando] = useState(null);
    const [periodoEditForm, setPeriodoEditForm] = useState({
        nombre: "",
        fecha_inicio: "",
        fecha_fin: ""
    });
    const [periodoEliminando, setPeriodoEliminando] = useState(null);
    const [eliminandoPeriodo, setEliminandoPeriodo] = useState(false);

    const [grupoEditando, setGrupoEditando] = useState(null);
    const [grupoEditForm, setGrupoEditForm] = useState({
        clave: "",
        semestre: ""
    });
    const [grupoEliminando, setGrupoEliminando] = useState(null);
    const [eliminandoGrupo, setEliminandoGrupo] = useState(false);


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


    const abrirEdicionUsuario = (usuario) => {

        setUsuarioEditando(usuario);

        setUsuarioEditForm({
            username: usuario.username,
            password: "",
            rol: usuario.rol
        });

        setError("");

    };


    const cerrarEdicionUsuario = () => {

        setUsuarioEditando(null);

        setUsuarioEditForm({
            username: "",
            password: "",
            rol: "USUARIO"
        });

    };


    const cambiarUsuarioEditado = (e) => {

        setUsuarioEditForm({
            ...usuarioEditForm,
            [e.target.name]: e.target.value
        });

    };


    const guardarUsuarioEditado = async (e) => {

        e.preventDefault();

        if (!usuarioEditForm.username || !usuarioEditForm.rol) {

            setError("El nombre de usuario y el rol son obligatorios.");

            return;

        }

        try {

            const datosUsuario = {
                username: usuarioEditForm.username,
                rol: usuarioEditForm.rol
            };

            if (usuarioEditForm.password) {
                datosUsuario.password = usuarioEditForm.password;
            }

            await api.put(
                `/usuarios/${usuarioEditando.id}`,
                datosUsuario
            );

            cerrarEdicionUsuario();
            mostrarMensaje("Usuario actualizado correctamente.");
            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo actualizar el usuario."
            );

        }

    };


    const eliminarUsuario = async () => {

        setEliminandoUsuario(true);

        try {

            await api.delete(
                `/usuarios/${usuarioEliminando.id}`
            );

            setUsuarioEliminando(null);
            mostrarMensaje("Usuario eliminado permanentemente.");
            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo eliminar el usuario."
            );

        } finally {

            setEliminandoUsuario(false);

        }

    };


    const abrirEdicionPeriodo = (periodo) => {

        setPeriodoEditando(periodo);

        setPeriodoEditForm({
            nombre: periodo.nombre,
            fecha_inicio: periodo.fecha_inicio.slice(0, 10),
            fecha_fin: periodo.fecha_fin.slice(0, 10)
        });

        setError("");

    };


    const cerrarEdicionPeriodo = () => {

        setPeriodoEditando(null);

        setPeriodoEditForm({
            nombre: "",
            fecha_inicio: "",
            fecha_fin: ""
        });

    };


    const cambiarPeriodoEditado = (e) => {

        setPeriodoEditForm({
            ...periodoEditForm,
            [e.target.name]: e.target.value
        });

    };


    const guardarPeriodoEditado = async (e) => {

        e.preventDefault();

        if (
            !periodoEditForm.nombre ||
            !periodoEditForm.fecha_inicio ||
            !periodoEditForm.fecha_fin
        ) {

            setError("Completa todos los datos del periodo.");

            return;

        }

        if (periodoEditForm.fecha_inicio >= periodoEditForm.fecha_fin) {

            setError("La fecha inicial debe ser menor a la fecha final.");

            return;

        }

        try {

            await api.put(
                `/periodos/${periodoEditando.id}`,
                periodoEditForm
            );

            cerrarEdicionPeriodo();
            mostrarMensaje("Periodo actualizado correctamente.");
            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo actualizar el periodo."
            );

        }

    };


    const abrirEliminacionPeriodo = (periodo) => {

        setPeriodoEliminando(periodo);

    };


    const eliminarPeriodo = async () => {

        setEliminandoPeriodo(true);

        try {

            await api.delete(
                `/periodos/${periodoEliminando.id}`
            );

            setPeriodoEliminando(null);
            mostrarMensaje("Periodo eliminado correctamente.");
            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo eliminar el periodo."
            );

        } finally {

            setEliminandoPeriodo(false);

        }

    };


    const abrirEdicionGrupo = (grupo) => {

        setGrupoEditando(grupo);

        setGrupoEditForm({
            clave: grupo.clave,
            semestre: String(grupo.semestre)
        });

        setError("");

    };


    const cerrarEdicionGrupo = () => {

        setGrupoEditando(null);

        setGrupoEditForm({
            clave: "",
            semestre: ""
        });

    };


    const cambiarGrupoEditado = (e) => {

        setGrupoEditForm({
            ...grupoEditForm,
            [e.target.name]: e.target.value
        });

    };


    const guardarGrupoEditado = async (e) => {

        e.preventDefault();

        if (!grupoEditForm.clave || !grupoEditForm.semestre) {

            setError("Completa la clave y semestre del grupo.");

            return;

        }

        try {

            await api.put(
                `/grupos/${grupoEditando.id}`,
                {
                    clave: grupoEditForm.clave,
                    semestre: Number(grupoEditForm.semestre)
                }
            );

            cerrarEdicionGrupo();
            mostrarMensaje("Grupo actualizado correctamente.");
            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo actualizar el grupo."
            );

        }

    };


    const abrirEliminacionGrupo = (grupo) => {

        setGrupoEliminando(grupo);

    };


    const eliminarGrupo = async () => {

        setEliminandoGrupo(true);

        try {

            await api.delete(
                `/grupos/${grupoEliminando.id}`
            );

            setGrupoEliminando(null);
            mostrarMensaje("Grupo eliminado correctamente.");
            cargarInformacion();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.mensaje ||
                "No se pudo eliminar el grupo."
            );

        } finally {

            setEliminandoGrupo(false);

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

                                                                <td>
                                                                    {
                                                                        usuario.username
                                                                    }
                                                                </td>

                                                                <td>

                                                                    <span className="role-badge">

                                                                        {
                                                                            usuario.rol
                                                                        }

                                                                    </span>

                                                                </td>

                                                                <td>

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

                                                                <td>

                                                                    <div className="admin-actions">

                                                                        <button
                                                                            className="secondary-button"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                abrirEdicionUsuario(
                                                                                    usuario
                                                                                )
                                                                            }
                                                                            aria-label={`Editar usuario ${usuario.username}`}
                                                                            title="Editar usuario"
                                                                        >
                                                                            <Pencil size={14} />
                                                                            Editar
                                                                        </button>

                                                                        <button
                                                                            className="secondary-button"
                                                                            type="button"
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
                                                                            className="icon-button delete-button"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setUsuarioEliminando(usuario)
                                                                            }
                                                                            aria-label={`Eliminar usuario ${usuario.username}`}
                                                                            title="Eliminar usuario"
                                                                        >
                                                                            <Trash2 size={16} />
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

                                                                <td>
                                                                    {
                                                                        periodo.nombre
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        periodo.fecha_inicio
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        periodo.fecha_fin
                                                                    }
                                                                </td>

                                                                <td>

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

                                                                <td>

                                                                    <div className="admin-actions">

                                                                        <button
                                                                            className="secondary-button"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                abrirEdicionPeriodo(
                                                                                    periodo
                                                                                )
                                                                            }
                                                                            aria-label={`Editar periodo ${periodo.nombre}`}
                                                                            title="Editar periodo"
                                                                        >
                                                                            <Pencil size={16} />
                                                                        </button>

                                                                        <button
                                                                            className="icon-button delete-button"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                abrirEliminacionPeriodo(
                                                                                    periodo
                                                                                )
                                                                            }
                                                                            aria-label={`Eliminar periodo ${periodo.nombre}`}
                                                                            title="Eliminar periodo"
                                                                        >
                                                                            <Trash2 size={16} />
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

                                                                <td>
                                                                    {
                                                                        grupo.clave
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        grupo.semestre
                                                                    }
                                                                </td>

                                                                <td>

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

                                                                <td>

                                                                    <div className="admin-actions">

                                                                        <button
                                                                            className="icon-button edit-button"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                abrirEdicionGrupo(
                                                                                    grupo
                                                                                )
                                                                            }
                                                                            aria-label={`Editar grupo ${grupo.clave}`}
                                                                            title="Editar grupo"
                                                                        >
                                                                            <Pencil size={16} />
                                                                        </button>

                                                                        <button
                                                                            className="icon-button delete-button"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                abrirEliminacionGrupo(
                                                                                    grupo
                                                                                )
                                                                            }
                                                                            aria-label={`Eliminar grupo ${grupo.clave}`}
                                                                            title="Eliminar grupo"
                                                                        >
                                                                            <Trash2 size={16} />
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


                                    <div className="rooms-grid">

                                        {salones.length === 0
                                            ? (
                                                <EmptyState
                                                    icon={Building2}
                                                    title="No hay salones registrados"
                                                    text="Los salones se configuran desde la sección de Salones."
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

                                                    </div>

                                                )
                                            )
                                        }

                                    </div>

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

                    <Modal
                        open={Boolean(usuarioEditando)}
                        onClose={cerrarEdicionUsuario}
                        title="Editar usuario"
                        description="Actualiza el nombre, rol o contraseña de la cuenta."
                        maxWidth={480}
                        footer={
                            <>
                                <button
                                    className="ui-button ui-button-ghost"
                                    type="button"
                                    onClick={cerrarEdicionUsuario}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="ui-button ui-button-primary"
                                    type="submit"
                                    form="editar-usuario-form"
                                >
                                    Guardar cambios
                                </button>
                            </>
                        }
                    >
                        <form
                            id="editar-usuario-form"
                            className="admin-modal-form"
                            onSubmit={guardarUsuarioEditado}
                        >
                            <div className="form-group">
                                <label htmlFor="editar-username">
                                    Nombre de usuario
                                </label>

                                <input
                                    id="editar-username"
                                    type="text"
                                    name="username"
                                    value={usuarioEditForm.username}
                                    onChange={cambiarUsuarioEditado}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editar-password">
                                    Nueva contraseña
                                </label>

                                <input
                                    id="editar-password"
                                    type="password"
                                    name="password"
                                    value={usuarioEditForm.password}
                                    onChange={cambiarUsuarioEditado}
                                    placeholder="Dejar vacía para conservarla"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editar-rol">
                                    Rol
                                </label>

                                <select
                                    id="editar-rol"
                                    name="rol"
                                    value={usuarioEditForm.rol}
                                    onChange={cambiarUsuarioEditado}
                                    required
                                >
                                    <option value="USUARIO">
                                        Usuario
                                    </option>

                                    <option value="ADMINISTRADOR">
                                        Administrador
                                    </option>
                                </select>
                            </div>
                        </form>
                    </Modal>

                    <Modal
                        open={Boolean(periodoEditando)}
                        onClose={cerrarEdicionPeriodo}
                        title="Editar periodo escolar"
                        description="Actualiza el nombre y las fechas del periodo."
                        maxWidth={480}
                        footer={
                            <>
                                <button
                                    className="ui-button ui-button-ghost"
                                    type="button"
                                    onClick={cerrarEdicionPeriodo}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="ui-button ui-button-primary"
                                    type="submit"
                                    form="editar-periodo-form"
                                >
                                    Guardar cambios
                                </button>
                            </>
                        }
                    >
                        <form
                            id="editar-periodo-form"
                            className="admin-modal-form"
                            onSubmit={guardarPeriodoEditado}
                        >
                            <div className="form-group">
                                <label htmlFor="editar-periodo-nombre">
                                    Nombre del periodo
                                </label>

                                <input
                                    id="editar-periodo-nombre"
                                    type="text"
                                    name="nombre"
                                    value={periodoEditForm.nombre}
                                    onChange={cambiarPeriodoEditado}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editar-periodo-inicio">
                                    Fecha de inicio
                                </label>

                                <input
                                    id="editar-periodo-inicio"
                                    type="date"
                                    name="fecha_inicio"
                                    value={periodoEditForm.fecha_inicio}
                                    onChange={cambiarPeriodoEditado}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editar-periodo-fin">
                                    Fecha final
                                </label>

                                <input
                                    id="editar-periodo-fin"
                                    type="date"
                                    name="fecha_fin"
                                    value={periodoEditForm.fecha_fin}
                                    onChange={cambiarPeriodoEditado}
                                    required
                                />
                            </div>
                        </form>
                    </Modal>

                    <ConfirmDialog
                        open={Boolean(periodoEliminando)}
                        title="¿Eliminar periodo escolar?"
                        message={
                            `El periodo "${periodoEliminando?.nombre || ""}" dejará de aparecer en el listado activo.`
                        }
                        onConfirm={eliminarPeriodo}
                        onCancel={() => setPeriodoEliminando(null)}
                        loading={eliminandoPeriodo}
                    />

                    <ConfirmDialog
                        open={Boolean(usuarioEliminando)}
                        title="¿Eliminar usuario?"
                        message={
                            `El usuario "${usuarioEliminando?.username || ""}" se eliminará permanentemente. Esta acción no se puede deshacer.`
                        }
                        onConfirm={eliminarUsuario}
                        onCancel={() => setUsuarioEliminando(null)}
                        loading={eliminandoUsuario}
                    />

                    <Modal
                        open={Boolean(grupoEditando)}
                        onClose={cerrarEdicionGrupo}
                        title="Editar grupo"
                        description="Actualiza la clave y el semestre del grupo."
                        maxWidth={420}
                        footer={
                            <>
                                <button
                                    className="ui-button ui-button-ghost"
                                    type="button"
                                    onClick={cerrarEdicionGrupo}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="ui-button ui-button-primary"
                                    type="submit"
                                    form="editar-grupo-form"
                                >
                                    Guardar cambios
                                </button>
                            </>
                        }
                    >
                        <form
                            id="editar-grupo-form"
                            className="admin-modal-form"
                            onSubmit={guardarGrupoEditado}
                        >
                            <div className="form-group">
                                <label htmlFor="editar-grupo-clave">
                                    Clave del grupo
                                </label>

                                <input
                                    id="editar-grupo-clave"
                                    type="text"
                                    name="clave"
                                    value={grupoEditForm.clave}
                                    onChange={cambiarGrupoEditado}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editar-grupo-semestre">
                                    Semestre
                                </label>

                                <input
                                    id="editar-grupo-semestre"
                                    type="number"
                                    name="semestre"
                                    min="1"
                                    max="12"
                                    value={grupoEditForm.semestre}
                                    onChange={cambiarGrupoEditado}
                                    required
                                />
                            </div>
                        </form>
                    </Modal>

                    <ConfirmDialog
                        open={Boolean(grupoEliminando)}
                        title="¿Eliminar grupo?"
                        message={
                            `El grupo "${grupoEliminando?.clave || ""}" dejará de aparecer en el listado activo.`
                        }
                        onConfirm={eliminarGrupo}
                        onCancel={() => setGrupoEliminando(null)}
                        loading={eliminandoGrupo}
                    />

        </Layout>

    );

}

export default Administracion;