import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function ProtectedRoute({ children, adminOnly = false }) {

    const { isAuthenticated, isAdmin, loading } = useAuth();


    if (loading) {

        return (

            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}>
                Cargando...
            </div>
        );
    }


    if (!isAuthenticated) {

        return <Navigate to="/" replace />;
    }


    if (adminOnly && !isAdmin) {

        return <Navigate to="/dashboard" replace />;
    }


    return children;
}


export default ProtectedRoute;
