import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const SELECTORES_ENFOCABLES = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
].join(", ");


function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = 560
}) {

    const modalRef = useRef(null);

    const previousFocusRef = useRef(null);

    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);


    useEffect(() => {

        if (!open) {
            return;
        }

        previousFocusRef.current = document.activeElement;

        const onKey = (e) => {

            if (e.key === "Escape") {

                onCloseRef.current();

                return;
            }

            if (e.key !== "Tab") {
                return;
            }

            const dialog = modalRef.current;

            if (!dialog) {
                return;
            }

            const enfocables =
                dialog.querySelectorAll(
                    SELECTORES_ENFOCABLES
                );

            if (enfocables.length === 0) {
                return;
            }

            const primero = enfocables[0];

            const ultimo =
                enfocables[enfocables.length - 1];

            if (
                e.shiftKey &&
                document.activeElement === primero
            ) {

                e.preventDefault();

                ultimo.focus();

            } else if (
                !e.shiftKey &&
                document.activeElement === ultimo
            ) {

                e.preventDefault();

                primero.focus();

            }

        };

        document.addEventListener("keydown", onKey);

        document.body.style.overflow = "hidden";

        requestAnimationFrame(() => {

            const dialog = modalRef.current;

            if (!dialog) {
                return;
            }

            const enfocables =
                dialog.querySelectorAll(
                    SELECTORES_ENFOCABLES
                );

            if (enfocables.length > 0) {
                enfocables[0].focus();
            }

        });

        return () => {

            document.removeEventListener("keydown", onKey);

            document.body.style.overflow = "";

            const previo = previousFocusRef.current;

            if (
                previo &&
                document.contains(previo)
            ) {

                previo.focus();

            }

        };

    }, [open]);

    if (!open) {
        return null;
    }

    return (

        <div
            className="ui-modal-overlay"
            onClick={onClose}
        >

            <div
                ref={modalRef}
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