import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Docentes from "./pages/Docentes";
import Materias from "./pages/Materias";
import Reportes from "./pages/Reportes";
import Horarios from "./pages/Horarios";
import Administracion from "./pages/Administracion";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/docentes"
                    element={<Docentes />}
                />

                <Route
                    path="/materias"
                    element={<Materias />}
                />

                <Route
                    path="/reportes"
                    element={<Reportes />}
                />

                <Route
                    path="/horarios"
                    element={<Horarios />}
                />

                <Route
                    path="/administracion"
                    element={<Administracion />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;