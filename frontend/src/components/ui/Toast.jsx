import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const iconos = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
};

function ToastProvider({ children }) {

    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((actual) => actual.filter((t) => t.id !== id));
    }, []);

    const notify = useCallback((type = "info", message) => {
        const id = Date.now() + Math.random();
        setToasts((actual) => [...actual, { id, type, message }]);
        setTimeout(() => dismiss(id), 4200);
    }, [dismiss]);

    return (

        <ToastContext.Provider value={notify}>

            {children}

            <div className="ui-toast-container" role="status" aria-live="polite">

                {toasts.map((toast) => {
                    const Icono = iconos[toast.type] || Info;

                    return (
                        <div
                            key={toast.id}
                            className={`ui-toast ${toast.type}`}
                        >
                            <Icono size={18} />
                            <span>{toast.message}</span>
                            <button
                                className="ui-toast-close"
                                onClick={() => dismiss(toast.id)}
                                aria-label="Cerrar notificación"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}

            </div>

        </ToastContext.Provider>

    );

}

function useToast() {
    return useContext(ToastContext);
}

export { ToastProvider, useToast };