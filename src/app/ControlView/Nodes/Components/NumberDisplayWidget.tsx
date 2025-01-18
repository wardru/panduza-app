interface NumberDisplayWidgetProps {
    value: number;
    unit?: string;
}

const NumberDisplayWidget: React.FC<NumberDisplayWidgetProps> = (props) => {
    return (
        <div className='text-center text-white'>
            <span className='font-semibold'>{props.value}</span>
            {props.unit ? <span className='ml-2 font-bold'>{props.unit}</span> : null}
        </div>
    );
};

export default NumberDisplayWidget;
