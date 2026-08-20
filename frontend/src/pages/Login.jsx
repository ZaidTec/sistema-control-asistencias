import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, HelpCircle } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import logo from "../assets/logo.jpg";

function Login() {

    const toast = useToast();

    const [username, setUsername] = useState(
        () => localStorage.getItem("dsc_remember_user") || ""
    );
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(
        () => localStorage.getItem("dsc_remember_user") !== null
    );

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

            if (remember) {

                localStorage.setItem(
                    "dsc_remember_user",
                    username
                );

            } else {

                localStorage.removeItem(
                    "dsc_remember_user"
                );

            }

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
                                        <User size={15} />
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
                                        <Lock size={15} />
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
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>

                                </div>

                            </div>



                            {/* ERROR */}

                            {error && (

                                <div className="login-error" role="alert">
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

                            <HelpCircle size={14} />

                           

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Login;