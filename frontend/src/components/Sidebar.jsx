import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpg";

function Sidebar({ colapsado, onToggle }) {

    const location = useLocation();
    const { usuario, logout } = useAuth();

    const esAdmin = usuario?.rol === "ADMINISTRADOR";

    const menuItems = [
        { path: "/dashboard", icon: "▦", label: "Dashboard" },
        { path: "/reportes", icon: "▥", label: "Reportes" },
        ...(esAdmin
            ? [
                { path: "/docentes", icon: "♙", label: "Docentes" },
                { path: "/horarios", icon: "▣", label: "Horarios" },
                { path: "/administracion", icon: "⚙", label: "Administración" }
            ]
            : [])
    ];

    return (

        <aside className="sidebar">

            <div className="sidebar-brand">

                <img src={logo} alt="Tecnológico Nacional de México" />

                <div>
                    <strong>DSC Control</strong>
                    <span>de Asistencias</span>
                </div>

            </div>

            <div className="sidebar-toggle-row">

                <button
                    className="sidebar-toggle"
                    title={colapsado ? "Expandir menú" : "Colapsar menú"}
                    onClick={onToggle}
                >
                    {colapsado ? "▶" : "◀"}
                </button>

            </div>

            <div className="user-profile">

                <div className="user-avatar">
                    {usuario?.username?.charAt(0).toUpperCase() || "U"}
                </div>

                <div>
                    <strong>{usuario?.username || "Usuario"}</strong>
                    <span>{usuario?.rol || "Sin rol"}</span>
                </div>

            </div>

            <nav className="sidebar-menu">

                {menuItems.map((item) => (

                    <Link
                        key={item.path}
                        to={item.path}
                        className={
                            `menu-item${
                                location.pathname === item.path
                                    ? " active"
                                    : ""
                            }`
                        }
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>

                ))}

            </nav>

            <button
                className="menu-item"
                onClick={logout}
                style={{ marginTop: "auto" }}
            >
                <span>⏻</span>
                Cerrar Sesión
            </button>

            <div className="sidebar-version">v1.0</div>

        </aside>

    );

}

export default Sidebar;