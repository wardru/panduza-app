import { useEffect, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeContainer from './AttributeContainer';
import { AttributeString } from '@/app/attribute';

export type StringDisplayNode = Node<{
    attribute: AttributeString;
}>;

const StringDisplayNode: React.FC<NodeProps<StringDisplayNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);

    useEffect(() => {
        const updateValue = () => setValue(props.data.attribute.value);

        props.data.attribute.subscribe(updateValue);

        return () => {
            props.data.attribute.unsubscribe(updateValue);
        };
    }, [props.data.attribute]);

    return (
        <AttributeContainer
            attribute={props.data.attribute}
            nodeProps={props}
        >
            <div className='flex items-center justify-center'>
                <label className='text-center text-white font-semibold px-1 py-0.5 text-lg rounded-md bg-gray-700'>
                    {value}
                </label>
            </div>
        </AttributeContainer>
    );
};

export default StringDisplayNode;
