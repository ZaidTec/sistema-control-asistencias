import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    CalendarDays,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import logo from "../assets/logo.jpg";

function Sidebar({ colapsado, onToggle }) {

    const location = useLocation();
    const { usuario, logout } = useAuth();

    const esAdmin = usuario?.rol === "ADMINISTRADOR";

    const menuItems = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/reportes", icon: ClipboardList, label: "Reportes" },
        ...(esAdmin
            ? [
                { path: "/docentes", icon: Users, label: "Docentes" },
                { path: "/horarios", icon: CalendarDays, label: "Calendario" },
                { path: "/administracion", icon: Settings, label: "Administración" }
            ]
            : [
                { path: "/monitor", icon: CalendarDays, label: "Calendario" }
            ])
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
                    {colapsado ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
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
                            <Icon size={18} strokeWidth={2} />
                            {item.label}
                        </Link>
                    );
                })}

                <button
                    className="menu-item sidebar-logout"
                    onClick={logout}
                >
                    <LogOut size={18} strokeWidth={2} />
                    Cerrar Sesión
                </button>

            </nav>

            <div className="sidebar-version">v1.0</div>

        </aside>

    );

}

export default Sidebar;