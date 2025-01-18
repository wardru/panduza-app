import { useEffect, useRef, useState } from 'react';

interface NumberSpinnerWidgetProps {
    value: number;
    min?: number;
    max?: number;
    unit?: string;
    disabled: boolean;
    onNewValue: (value: number) => void;
}

function clamp(value: number, min: number, max: number): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

const NumberSpinnerWidget: React.FC<NumberSpinnerWidgetProps> = (props) => {
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

    const handleNewValue = (newValue: number | string) => {
        // number can never be empty by definition
        if (newValue === '') {
            setValue(value);
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
                className='relative flex items-center'
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    className='nodrag nopan nowheel w-full px-2 py-1 text-center text-lg font-medium text-black rounded-md focus:outline-none focus:ring-4 focus:ring-blue-500'
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
                    className='nodrag nopan nowheel absolute right-0 top-0 bg-gray-200 text-gray-600 hover:bg-gray-300 w-8 h-1/2 rounded-tr-md flex items-center justify-center'
                    onMouseDown={handleMouseDownInc}
                    onMouseUp={handleMouseUpInc}
                    onMouseLeave={handleMouseUpInc}
                >
                    {' '}
                    ▲{' '}
                </button>
                <button
                    className='nodrag nopan nowheel absolute right-0 bottom-0 bg-gray-200 text-gray-600 hover:bg-gray-300 w-8 h-1/2 rounded-br-md flex items-center justify-center'
                    onMouseDown={handleMouseDownDec}
                    onMouseUp={handleMouseUpDec}
                    onMouseLeave={handleMouseUpDec}
                >
                    {' '}
                    ▼{' '}
                </button>
            </div>
            {props.unit ? <label className='text-white text-lg'>{props.unit}</label> : null}
        </div>
    );
};

export default NumberSpinnerWidget;
