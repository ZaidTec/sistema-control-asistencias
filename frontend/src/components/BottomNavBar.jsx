import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    ClipboardList,
    CalendarDays,
    Users,
    Settings,
    LogOut
} from "lucide-react";
import "../styles/bottomnav.css";


function BottomNavBar() {

    const location = useLocation();

    const { usuario, logout } = useAuth();

    const esAdmin = usuario?.rol === "ADMINISTRADOR";

    const items = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ...(esAdmin
            ? [
                { path: "/reportes", icon: ClipboardList, label: "Reportes" },
                { path: "/horarios", icon: CalendarDays, label: "Horarios" },
                { path: "/docentes", icon: Users, label: "Docentes" },
                { path: "/administracion", icon: Settings, label: "Admin" }
            ]
            : [
                { path: "/monitor", icon: CalendarDays, label: "Horarios" }
            ])
    ];

    const etiquetaCerrar =
        esAdmin ? "Salir" : "Cerrar sesión";


    return (

        <nav
            className="bottom-nav"
            aria-label="Navegación principal"
        >

            {items.map((item) => {

                const Icon = item.icon;

                const activo =
                    location.pathname === item.path;

                return (

                    <Link
                        key={item.path}
                        to={item.path}
                        className={
                            `bottom-nav-item${
                                activo
                                    ? " bottom-nav-item-active"
                                    : ""
                            }`
                        }
                        aria-current={
                            activo ? "page" : undefined
                        }
                    >

                        <Icon size={22} strokeWidth={2} aria-hidden="true" />
                        <span>{item.label}</span>

                    </Link>

                );

            })}


            <button
                type="button"
                className="bottom-nav-item bottom-nav-logout"
                onClick={logout}
            >

                <LogOut size={22} strokeWidth={2} aria-hidden="true" />
                <span>{etiquetaCerrar}</span>

            </button>

        </nav>

    );

}


export default BottomNavBar;