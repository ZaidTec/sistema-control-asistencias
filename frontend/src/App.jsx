import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Docentes from "./pages/Docentes";
import Reportes from "./pages/Reportes";
import Horarios from "./pages/Horarios";
import Administracion from "./pages/Administracion";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    <Route
                        path="/"
                        element={<Login />}
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/docentes"
                        element={
                            <ProtectedRoute adminOnly>
                                <Docentes />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reportes"
                        element={
                            <ProtectedRoute>
                                <Reportes />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/horarios"
                        element={
                            <ProtectedRoute adminOnly>
                                <Horarios />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/administracion"
                        element={
                            <ProtectedRoute adminOnly>
                                <Administracion />
                            </ProtectedRoute>
                        }
                    />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;