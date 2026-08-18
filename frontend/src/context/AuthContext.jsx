import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {

    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const tokenGuardado = localStorage.getItem("token");
        const usuarioGuardado = localStorage.getItem("usuario");

        if (tokenGuardado && usuarioGuardado) {

            setToken(tokenGuardado);
            setUsuario(JSON.parse(usuarioGuardado));
        }

        setLoading(false);

    }, []);


    const login = (token, usuario) => {

        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(usuario));

        setToken(token);
        setUsuario(usuario);
    };


    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        setToken(null);
        setUsuario(null);
    };


    const isAuthenticated = !!token;

    const isAdmin = usuario?.rol === "ADMINISTRADOR";


    return (

        <AuthContext.Provider
            value={{
                usuario,
                token,
                login,
                logout,
                isAuthenticated,
                isAdmin,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth debe usarse dentro de un AuthProvider"
        );
    }

    return context;
}
