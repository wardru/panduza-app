import { useEffect, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import ContainerNode from './AttributeContainer';
import { AttributeSi } from '@/app/attribute';

export type SiSpinnerNode = Node<{
    attribute: AttributeSi;
}>;

const SiSpinnerNode: React.FC<NodeProps<SiSpinnerNode>> = (props) => {
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
        // Clamping
        if (Number(event.currentTarget.value) > props.data.attribute.max) {
            event.target.value = String(props.data.attribute.max);
        }
        if (Number(event.currentTarget.value) < props.data.attribute.min) {
            event.target.value = String(props.data.attribute.min);
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
                    //TODO: take care of decimal values
                    placeholder='Enter value'
                    max={props.data.attribute.max}
                    min={props.data.attribute.min}
                    onBlur={handleOnBlur}
                    onKeyDown={handleKeyDown}
                />
                <span className={`ml-2 text-white font-bold`}>{props.data.attribute.unit}</span>
            </div>
        </ContainerNode>
    );
};

export default SiSpinnerNode;
