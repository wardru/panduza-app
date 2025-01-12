import { useEffect, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeContainer from './AttributeContainer';
import { AttributeEnum } from '@/app/attribute';

export type EnumInputNode = Node<{
    attribute: AttributeEnum;
}>;

const EnumInputNode: React.FC<NodeProps<EnumInputNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);
    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const updateValue = () => setValue(props.data.attribute.value);

        props.data.attribute.subscribe(updateValue);

        return () => {
            props.data.attribute.unsubscribe(updateValue);
        };
    }, [props.data.attribute]);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        props.data.attribute.publish(event.currentTarget.value);

        if (props.data.attribute.mode === 'WO') {
            setValue(event.currentTarget.value);
        }
    };

    return (
        <AttributeContainer attribute={props.data.attribute}>
            <div className='flex items-center justify-center'>
                <select
                    className='nodrag nopan nowheel w-full px-2 py-1 text-center text-lg font-medium text-black rounded-md focus:outline-none focus:ring-4 focus:ring-blue-500'
                    onChange={handleSelectChange}
                    value={value}
                >
                    {props.data.attribute.choices.map((choice) => (
                        <option key={props.data.attribute.topic + '-' + choice}> {choice} </option>
                    ))}
                </select>
            </div>
        </AttributeContainer>
    );
};

export default EnumInputNode;
