import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpg";

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!username || !password) {

            setError("Ingresa tu usuario y contraseña.");

            return;
        }

        try {

            setLoading(true);

            const response = await api.post("/auth/login", {
                username,
                password
            });

            login(
                response.data.token,
                response.data.usuario
            );

            navigate("/dashboard");

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.mensaje ||
                "No se pudo iniciar sesión."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <main className="login-page">

            <section className="login-container">


                {/* PANEL IZQUIERDO */}

                <div className="login-brand">

                    <div className="logo-container">

                        <img
                            src={logo}
                            alt="Tecnológico Nacional de México"
                        />

                    </div>


                    <div className="brand-content">

                        <span className="brand-dsc">
                            DSC
                        </span>

                        <h1>
                            Sistema de Control de
                            <br />
                            Asistencias
                        </h1>

                    </div>

                </div>


                {/* PANEL DERECHO */}

                <div className="login-form-container">

                    <div className="login-form">


                        <div className="login-header">

                            <h2>
                                Iniciar Sesión
                            </h2>

                            <p>
                                Ingrese sus credenciales
                            </p>

                        </div>


                        <form onSubmit={handleSubmit}>


                            {/* USUARIO */}

                            <div className="form-group">

                                <label htmlFor="username">
                                    Nombre de Usuario
                                </label>

                                <div className="input-container">

                                    <span className="input-icon">
                                        ✉
                                    </span>

                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="username"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        autoComplete="username"
                                    />

                                </div>

                            </div>


                            {/* CONTRASEÑA */}

                            <div className="form-group">

                                <label htmlFor="password">
                                    Contraseña
                                </label>

                                <div className="input-container">

                                    <span className="input-icon">
                                        🔒
                                    </span>

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        className="password-button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Ocultar contraseña"
                                                : "Mostrar contraseña"
                                        }
                                    >
                                        {showPassword ? "◉" : "◌"}
                                    </button>

                                </div>

                            </div>


                            {/* RECORDAR / RECUPERAR */}

                            <div className="login-options">

                                <label className="remember-option">

                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) =>
                                            setRemember(e.target.checked)
                                        }
                                    />

                                    <span>
                                        Recordarme
                                    </span>

                                </label>


                                <button
                                    type="button"
                                    className="forgot-button"
                                    onClick={() =>
                                        alert(
                                            "La recuperación de contraseña se agregará posteriormente."
                                        )
                                    }
                                >
                                    Recuperar contraseña
                                </button>

                            </div>


                            {/* ERROR */}

                            {error && (

                                <div className="login-error">
                                    {error}
                                </div>

                            )}


                            {/* BOTÓN */}

                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Ingresando..."
                                    : "Entrar al Sistema"}

                            </button>


                        </form>


                        {/* AYUDA */}

                        <div className="login-help">

                            <span>
                                ?
                            </span>

                            <p>
                                ¿Necesita ayuda para acceder?
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Login;