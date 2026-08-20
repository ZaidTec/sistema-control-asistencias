import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import BottomNavBar from "./BottomNavBar";
import "../styles/layout.css";
import "../styles/sidebar.css";
import "../styles/bottomnav.css";

function Layout({ titulo, children }) {

    const [colapsado, setColapsado] = useState(false);

    const { usuario } = useAuth();

    return (

        <div
            className={
                colapsado
                    ? "layout layout-collapsed"
                    : "layout"
            }
        >

            <Sidebar
                colapsado={colapsado}
                onToggle={() =>
                    setColapsado(!colapsado)
                }
            />

            <main className="layout-main">

                <header className="dashboard-header">

                    <h1>
                        {titulo}
                    </h1>


                    <div className="header-user">

                        <div className="header-avatar">
                            {usuario?.username?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <span>
                            {usuario?.username || "Usuario"}
                        </span>

                    </div>

                </header>


                <div className="layout-content">

                    {children}

                </div>

            </main>

            <BottomNavBar />

        </div>

    );

}

export default Layout;