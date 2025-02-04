import { useState, useEffect } from 'react';

interface StringInputProps {
    value: string;
    placeholder?: string;
    disabled?: boolean;
    onNewValue: (value: string) => void;
}

const StringInput: React.FC<StringInputProps> = (props) => {
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    const handleNewValue = (value: string) => {
        props.onNewValue(value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            if (!event.shiftKey) {
                handleNewValue(event.currentTarget.value);
                event.preventDefault();
            }
        } else {
            event.stopPropagation();
        }
    };

    const handleOnBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        if (event.relatedTarget === event.target) {
            return;
        }

        handleNewValue(event.currentTarget.value);
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value;

        setValue(newValue);
    };
    return (
        <textarea
            className='nodrag nopan nowheel h-8 w-full'
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

export default StringInput;
