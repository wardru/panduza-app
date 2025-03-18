import { useEffect, useRef, useState } from 'react';

interface NumberSpinnerProps {
    value: number;
    min?: number;
    max?: number;
    unit?: string;
    disabled?: boolean;
    onNewValue: (value: number) => void;
}

import InputArrowDown from '../../../assets/icons/InputArrowDown.svg';
import InputArrowUp from '../../../assets/icons/InputArrowUp.svg';

function clamp(value: number, min: number, max: number): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

const NumberSpinner: React.FC<NumberSpinnerProps> = (props) => {
    const INITIAL_DELAY = 800; //ms
    const FINAL_DELAY = 80; //ms

    const [value, setValue] = useState<string | number>(props.value);
    const [isPressingUp, setIsPressingUp] = useState(false);
    const [isPressingDown, setIsPressingDown] = useState(false);
    const [delay, setDelay] = useState(INITIAL_DELAY);

    // Ref to the input element
    const inputRef = useRef<HTMLInputElement>(null);

    const min = props.min ?? Number.MIN_SAFE_INTEGER;
    const max = props.max ?? Number.MAX_SAFE_INTEGER;

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    // Continuous increment logic with dynamic delay
    useEffect(() => {
        if (isPressingUp) {
            const interval = setInterval(() => {
                setValue((prevCount) => clamp(Number(prevCount) + 1, min, max));
                setDelay(FINAL_DELAY);
            }, delay);

            return () => clearInterval(interval);
        }

        if (isPressingDown) {
            const interval = setInterval(() => {
                setValue((prevCount) => clamp(Number(prevCount) - 1, min, max));
                setDelay(FINAL_DELAY);
            }, delay);

            return () => clearInterval(interval);
        }
    }, [isPressingUp, isPressingDown, delay, min, max]);

    const handleNewValue = (newValue: string) => {
        // number can never be empty or NaN by definition
        if (newValue === '' || Number.isNaN(newValue)) {
            setValue(value);
            return;
        }

        // Auto-fix cases like "1e", "1e+", "1e-" → "1e0", "1e+0", "1e-0"
        if (/^[-+]?\d*\.?\d*[eE][-+]?$/.test(newValue)) {
            newValue += '0';
            setValue(Number(newValue));
            props.onNewValue(Number(newValue));
            return;
        }

        if (props.value != Number(newValue)) {
            const clampedValue = clamp(Number(newValue), min, max);
            setValue(clampedValue);
            props.onNewValue(clampedValue);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleNewValue(event.currentTarget.value);
        } else {
            event.stopPropagation();
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

        // Accept only digits, decimal points, negative sign at the start, and exponent notation
        if (/^[-+]?\d*\.?\d*([eE][+-]?\d*)?$/.test(newValue) && /^(?![+-]?[eE])/.test(newValue)) {
            setValue(newValue);
        }
    };

    // Immediate increment on mouse down
    const handleMouseDownInc = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e.button != 0) return;
        e.preventDefault(); // Prevent button from gaining focus
        inputRef.current?.focus();
        setValue((prevCount) => clamp(Number(prevCount) + 1, min, max)); // Immediate increment
        setDelay(INITIAL_DELAY); // Reset the delay on every new press
        setIsPressingUp(true); // Start continuous increment
    };

    const handleMouseUpInc = () => {
        setIsPressingUp(false); // Stop continuous increment
    };

    // Immediate decrement on mouse down
    const handleMouseDownDec = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e.button != 0) return;
        e.preventDefault(); // Prevent button from gaining focus
        inputRef.current?.focus();
        setValue((prevCount) => clamp(Number(prevCount) - 1, min, max)); // Immediate decrement
        setIsPressingDown(true); // Start continuous decrement
        setDelay(INITIAL_DELAY); // Reset the delay on every new press
    };

    const handleMouseUpDec = () => {
        setIsPressingDown(false); // Stop continuous decrement
    };

    return (
        <div className='flex items-center space-x-2'>
            <div
                className='nodrag nopan flex h-8 overflow-hidden rounded-md border border-[#505050]'
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    type='text'
                    value={value}
                    ref={inputRef}
                    placeholder='Enter number'
                    //TODO: take care of decimal values
                    onChange={handleOnChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleOnBlur}
                    className='w-40 rounded-none'
                />
                <div className='flex w-5 flex-col bg-[#424242]'>
                    <button
                        className='flex flex-grow items-center justify-center hover:bg-[#525252]'
                        onMouseDown={handleMouseDownInc}
                        onMouseUp={handleMouseUpInc}
                        onMouseLeave={handleMouseUpInc}
                    >
                        <InputArrowUp className='size-2' />
                    </button>

                    <button
                        className='flex flex-grow items-center justify-center hover:bg-[#525252]'
                        onMouseDown={handleMouseDownDec}
                        onMouseUp={handleMouseUpDec}
                        onMouseLeave={handleMouseUpDec}
                    >
                        <InputArrowDown className='size-2' />
                    </button>
                </div>
            </div>
            {props.unit ? <label className='text-lg'>{props.unit}</label> : null}
        </div>

        /*
        <div className='flex items-center space-x-2'>
            <div
                className='relative flex items-center'
            >
                <input
                    className='nodrag nopan h-8'
                    type='text'
                    value={value}
                    ref={inputRef}
                    placeholder='Enter number'
                    //TODO: take care of decimal values
                    onChange={handleOnChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleOnBlur}
                />
                <button
                    className='nodrag nopan absolute top-0 right-0 flex h-1/2 w-6 items-center justify-center rounded-tr-md bg-gray-200/0 bg-green-600 text-gray-600 hover:bg-gray-300'
                    onMouseDown={handleMouseDownInc}
                    onMouseUp={handleMouseUpInc}
                    onMouseLeave={handleMouseUpInc}
                ></button>
                <label className='size-4 bg-red-600'></label>
                <button
                    className='nodrag nopan absolute right-0 bottom-0 flex hidden h-1/2 w-8 items-center justify-center rounded-br-md bg-gray-200 text-gray-600 hover:bg-gray-300'
                    onMouseDown={handleMouseDownDec}
                    onMouseUp={handleMouseUpDec}
                    onMouseLeave={handleMouseUpDec}
                >
                    {' '}
                    ▼{' '}
                </button>
            </div>

        </div>
            */
    );
};

export default NumberSpinner;
