import { useEffect } from "react";
import { X } from "lucide-react";

function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = 560
}) {

    useEffect(() => {

        if (!open) {
            return;
        }

        const onKey = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", onKey);

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };

    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (

        <div
            className="ui-modal-overlay"
            onClick={onClose}
        >

            <div
                className="ui-modal"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                style={{ maxWidth }}
                onClick={(e) => e.stopPropagation()}
            >

                <div className="ui-modal-header">

                    <div>

                        <h2>{title}</h2>

                        {description && (
                            <p>{description}</p>
                        )}

                    </div>

                    <button
                        className="ui-modal-close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="ui-modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="ui-modal-footer">
                        {footer}
                    </div>
                )}

            </div>

        </div>

    );

}

export default Modal;