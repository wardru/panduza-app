import { useEffect, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import ContainerNode from './AttributeContainer';
import { AttributeNumber } from '@/app/attribute';

export type NumberSpinnerNode = Node<{
    attribute: AttributeNumber;
}>;

const NumberSpinnerNode: React.FC<NodeProps<NumberSpinnerNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);
    //     const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const updateValue = () => setValue(props.data.attribute.value);

        props.data.attribute.subscribe(updateValue);

        return () => {
            props.data.attribute.unsubscribe(updateValue);
        };
    }, [props.data.attribute]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') {
            return;
        }

        event.currentTarget.blur();
    };

    const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.relatedTarget === event.target) {
            return;
        }

        try {
            props.data.attribute.publish(Number(props.data.attribute.validateInput(event.currentTarget.value)));
            //setError(null);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error(errorMessage);
            //setError(errorMessage);
        }
    };

    return (
        <ContainerNode attribute={props.data.attribute}>
            <div className='flex items-center'>
                <input
                    className={`text-black bg-white px-2 py-1 rounded-md flex-1 text-center nodrag`}
                    type='number'
                    defaultValue={value}
                    //value={value} //FIXME: This is a bug, the value should be set to the value of the attribute and defaultValue should be removed
                    placeholder='Enter value'
                    onBlur={handleOnBlur}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </ContainerNode>
    );
};

export default NumberSpinnerNode;
