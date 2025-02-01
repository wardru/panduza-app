interface StringDisplayProps {
    value: string;
    rows: number;
}

const StringDisplay: React.FC<StringDisplayProps> = (props) => {
    return (
        <textarea
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            readOnly
            value={props.value}
            rows={props.rows}
            className=' nodrag nowheel text-center justify-center text-black font-semibold px-1 py-0.5 text-lg rounded-md bg-white h-min w-min'
        ></textarea>
    );
};

export default StringDisplay;
