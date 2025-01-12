import { useEffect, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeContainer from './AttributeContainer';
import { AttributeString } from '@/app/attribute';

export type StringInputNode = Node<{
    attribute: AttributeString;
}>;

const StringInputNode: React.FC<NodeProps<StringInputNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);
    const [prevPub, setPrevPub] = useState(value);
    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const updateValue = () => setValue(props.data.attribute.value);

        props.data.attribute.subscribe(updateValue);

        return () => {
            props.data.attribute.unsubscribe(updateValue);
        };
    }, [props.data.attribute]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && event.currentTarget.value !== prevPub) {
            props.data.attribute.publish(event.currentTarget.value);
            setPrevPub(event.currentTarget.value);
        }
    };

    const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.relatedTarget === event.target) {
            return;
        }

        const str = event.currentTarget.value;

        if (str === '' || str === prevPub) {
            return;
        }

        props.data.attribute.publish(event.currentTarget.value);
        setPrevPub(event.currentTarget.value);
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;

        setValue(newValue);
    };

    return (
        <AttributeContainer
            attribute={props.data.attribute}
            nodeProps={props}
        >
            <div
                className='flex items-center'
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    className='nodrag nopan nowheel w-full px-2 py-1 text-center text-lg font-medium text-black rounded-md focus:outline-none focus:ring-4 focus:ring-blue-500'
                    type='text'
                    value={value}
                    placeholder='Enter string'
                    onBlur={handleOnBlur}
                    onKeyDown={handleKeyDown}
                    onChange={handleOnChange}
                />
            </div>
        </AttributeContainer>
    );
};

export default StringInputNode;
