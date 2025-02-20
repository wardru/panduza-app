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
            className='nodrag nopan nowheel'
        ></textarea>
    );
};

export default StringDisplay;
