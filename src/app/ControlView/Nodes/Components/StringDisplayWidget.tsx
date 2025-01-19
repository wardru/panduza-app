interface StringDisplayWidgetProps {
    value: string;
}

const StringDisplayWidget: React.FC<StringDisplayWidgetProps> = (props) => {
    return (
        <textarea
            onClick={(e) => e.stopPropagation()}
            readOnly
            value={props.value}
            rows={1}
            className=' nodrag nowheel text-center justify-center text-white font-semibold px-1 py-0.5 text-lg rounded-md bg-gray-700 h-min w-min'
        ></textarea>
    );
};

export default StringDisplayWidget;
