interface NumberDisplayWidgetProps {
    value: number;
    unit?: string;
}

const NumberDisplayWidget: React.FC<NumberDisplayWidgetProps> = (props) => {
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className='nodrag nopan flex text-center w-min  text-white select-text'
        >
            <p className='font-semibold'>{props.value}</p>
            {props.unit ? <span className='ml-2 font-bold'>{props.unit}</span> : null}
        </div>
    );
};

export default NumberDisplayWidget;
