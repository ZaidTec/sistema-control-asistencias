function EmptyState({ icon: Icon, title, text }) {

    return (

        <div className="ui-empty">

            {Icon && (
                <Icon size={34} />
            )}

            <strong>{title}</strong>

            {text && (
                <p>{text}</p>
            )}

        </div>

    );

}

export default EmptyState;