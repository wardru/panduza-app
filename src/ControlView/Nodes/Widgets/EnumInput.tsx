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
            className='nodrag nopan bg-box focus:ring-active w-full rounded-md px-2 py-1 text-center text-lg font-medium focus:ring-3 focus:outline-hidden'
            onChange={handleSelectChange}
            value={props.value}
            disabled={props.disabled}
        >
            {props.choices.map((choice) => (
                <option
                    className='text-center'
                    key={choice}
                >
                    {' '}
                    {choice}{' '}
                </option>
            ))}
        </select>
    );
};

export default EnumInput;
