import "./button.component.scss"

export default function Button({ children, onClick, type, disabled, className }) {
    return (
        <button 
            type={type} 
            onClick={onClick} 
            disabled={disabled}
            className={className}
        >
            {children}
        </button>
    );
}