interface EnumInputProps {
    value: string;
    disabled?: boolean;
    choices: string[];
    onNewValue: (value: string) => void;
}

const EnumInput: React.FC<EnumInputProps> = (props) => {
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        props.onNewValue(event.currentTarget.value);
    };

    return (
        <select
            className='nodrag nopan w-full px-2 py-1 text-center text-lg font-medium text-black rounded-md focus:outline-none focus:ring-4 focus:ring-blue-500'
            onChange={handleSelectChange}
            value={props.value}
            disabled={props.disabled}
        >
            {props.choices.map((choice) => (
                <option key={choice}> {choice} </option>
            ))}
        </select>
    );
};

export default EnumInput;
