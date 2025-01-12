import { useEffect, useRef, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeContainer from './AttributeContainer';
import { AttributeNumber } from '@/app/attribute';

export type NumberSpinnerNode = Node<{
    attribute: AttributeNumber;
}>;

const NumberSpinnerNode: React.FC<NodeProps<NumberSpinnerNode>> = (props) => {
    const INITIAL_DELAY = 800; //ms
    const FINAL_DELAY = 80; //ms

    const [value, setValue] = useState<string | number>(props.data.attribute.value);
    const [prevPubSub, setPrevPubSub] = useState<string | number>(value);
    const [isPressingUp, setIsPressingUp] = useState(false);
    const [isPressingDown, setIsPressingDown] = useState(false);
    const [delay, setDelay] = useState(INITIAL_DELAY);
    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    // Ref to the input element
    const inputRef = useRef<HTMLInputElement>(null);

    function pub(val: string): void {
        // cache the previous value to prevent unnecessary publishes
        if (val === prevPubSub) {
            return;
        }

        try {
            props.data.attribute.publish(Number(props.data.attribute.validateInput(val)));
            //setError(null);
            setPrevPubSub(val);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error(errorMessage);
            //setError(errorMessage);
        }
    }

    useEffect(() => {
        const updateValue = () => {
            setValue(props.data.attribute.value);
            setPrevPubSub(props.data.attribute.value);
        };

        props.data.attribute.subscribe(updateValue);

        return () => {
            props.data.attribute.unsubscribe(updateValue);
        };
    }, [props.data.attribute]);

    // Continuous increment logic with dynamic delay
    useEffect(() => {
        if (isPressingUp) {
            const interval = setInterval(() => {
                setValue((prevCount) => Number(prevCount) + 1);
                setDelay(FINAL_DELAY);
            }, delay);

            return () => clearInterval(interval);
        }

        if (isPressingDown) {
            const interval = setInterval(() => {
                setValue((prevCount) => Number(prevCount) - 1);
                setDelay(FINAL_DELAY);
            }, delay);

            return () => clearInterval(interval);
        }
    }, [isPressingUp, isPressingDown, delay]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            // number can never be empty by definition
            //TODO: do this inside pub function
            if (event.currentTarget.value === '') {
                setValue(prevPubSub);
                return;
            }

            setValue(Number(event.currentTarget.value));
            pub(String(event.currentTarget.value));
        }
    };

    const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.relatedTarget === event.target) {
            return;
        }
        // number can never be empty by definition
        //TODO: do this inside pub function
        if (event.currentTarget.value === '') {
            setValue(prevPubSub);
            return;
        }

        setValue(Number(event.currentTarget.value));
        pub(String(event.currentTarget.value));
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
        e.preventDefault(); // Prevent button from gaining focus
        inputRef.current?.focus();
        setValue((prevCount) => Number(prevCount) + 1); // Immediate increment
        setDelay(INITIAL_DELAY); // Reset the delay on every new press
        setIsPressingUp(true); // Start continuous increment
    };

    const handleMouseUpInc = () => {
        setIsPressingUp(false); // Stop continuous increment
    };

    // Immediate decrement on mouse down
    const handleMouseDownDec = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Prevent button from gaining focus
        inputRef.current?.focus();
        setValue((prevCount) => Number(prevCount) - 1); // Immediate decrement
        setIsPressingDown(true); // Start continuous decrement
        setDelay(INITIAL_DELAY); // Reset the delay on every new press
    };

    const handleMouseUpDec = () => {
        setIsPressingDown(false); // Stop continuous decrement
    };

    return (
        <AttributeContainer
            attribute={props.data.attribute}
            nodeProps={props}
        >
            <div className='relative flex items-center'>
                <input
                    className='nodrag nopan nowheel w-full px-2 py-1 text-center text-lg font-medium text-black rounded-md focus:outline-none focus:ring-4 focus:ring-blue-500'
                    type='text'
                    value={value}
                    ref={inputRef}
                    placeholder='Enter string'
                    //TODO: take care of decimal values
                    onChange={handleOnChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleOnBlur}
                    onClick={(e) => e.stopPropagation()}
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
        </AttributeContainer>
    );
};

export default NumberSpinnerNode;
