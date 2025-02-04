interface BooleanButtonProps {
    text: string;
    disabled?: boolean;
    onClick: () => void;
}

const BooleanButton: React.FC<BooleanButtonProps> = (props) => {
    return (
        <button
            className='nodrag nopan bg-active rounded-lg px-3 py-1.5 active:scale-95'
            disabled={props.disabled}
            onClick={(e) => {
                e.stopPropagation();
                props.onClick();
            }}
        >
            {props.text}
        </button>
    );
};

export default BooleanButton;
