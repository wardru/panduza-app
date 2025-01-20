interface BooleanButtonWidgetProps {
    text: string;
    disabled?: boolean;
    onClick: () => void;
}

const BooleanButtonWidget: React.FC<BooleanButtonWidgetProps> = (props) => {
    return (
        <button
            className='nodrag nopan px-4 py-2 bg-green-800 text-white rounded-lg active:scale-95'
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

export default BooleanButtonWidget;
