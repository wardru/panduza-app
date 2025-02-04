interface NumberDisplayProps {
    value: number;
    unit?: string;
}

const NumberDisplay: React.FC<NumberDisplayProps> = (props) => {
    return (
        <p
            className='nodrag nopan selection:bg-active inline-block px-4 py-1 font-semibold select-text'
            onClick={(e) => e.stopPropagation()}
        >
            {props.value}
            {props.unit && <>&nbsp;&nbsp;{props.unit}</>}
        </p>
    );
};

export default NumberDisplay;
