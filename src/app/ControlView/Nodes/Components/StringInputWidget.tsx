import { useState, useEffect } from 'react';

interface StringInputWidgetProps {
    value: string;
    placeholder?: string;
    disabled?: boolean;
    onNewValue: (value: string) => void;
}

const StringInputWidget: React.FC<StringInputWidgetProps> = (props) => {
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    const handleNewValue = (value: string) => {
        if (value === props.value) {
            return;
        }

        props.onNewValue(value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleNewValue(event.currentTarget.value);
        }
    };

    const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.relatedTarget === event.target) {
            return;
        }

        handleNewValue(event.currentTarget.value);
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;

        setValue(newValue);
    };
    return (
        <input
            className='nodrag nopan w-full px-2 py-1 text-center text-lg font-medium text-black rounded-md focus:outline-none focus:ring-4 focus:ring-blue-500'
            type='text'
            value={value}
            disabled={props.disabled}
            placeholder={props.placeholder}
            onBlur={handleOnBlur}
            onKeyDown={handleKeyDown}
            onChange={handleOnChange}
            onClick={(e) => e.stopPropagation()}
        />
    );
};

export default StringInputWidget;
