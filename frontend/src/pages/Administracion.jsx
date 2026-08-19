import { useEffect, useState } from "react";
import {
    Users,
    CalendarDays,
    BookOpen,
    UsersRound,
    Building2,
    Settings
} from "lucide-react";
import api from "../services/api";
import Layout from "../components/Layout";
import MateriasTab from "../components/admin/MateriasTab";
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

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {periodos.length === 0 ? (

                                                    <tr>

                                                        <td
                                                            colSpan="4"
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

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {grupos.length === 0 ? (

                                                    <tr>

                                                        <td
                                                            colSpan="3"
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

        </Layout>

    );

}

export default Administracion;