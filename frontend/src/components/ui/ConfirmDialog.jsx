import Modal from "./Modal";

function ConfirmDialog({
    open,
    title = "¿Confirmar acción?",
    message,
    confirmLabel = "Eliminar",
    cancelLabel = "Cancelar",
    onConfirm,
    onCancel,
    loading = false
}) {

    return (

        <Modal
            open={open}
            onClose={onCancel}
            title={title}
            maxWidth={420}
        >

            <p className="ui-confirm-message">
                {message}
            </p>

            <div className="ui-confirm-actions">

                <button
                    className="ui-button ui-button-ghost"
                    onClick={onCancel}
                    disabled={loading}
                >
                    {cancelLabel}
                </button>

                <button
                    className="ui-button ui-button-danger"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? "Procesando..." : confirmLabel}
                </button>

            </div>

        </Modal>

    );

}

export default ConfirmDialog;