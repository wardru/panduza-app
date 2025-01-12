import { useEffect, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeContainer from './AttributeContainer';
import { AttributeSi } from '@/app/attribute';

export type SiDisplayNode = Node<{
    attribute: AttributeSi;
}>;

const SiDisplayNode: React.FC<NodeProps<SiDisplayNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);

    useEffect(() => {
        const updateValue = () => setValue(props.data.attribute.value);

        props.data.attribute.subscribe(updateValue);

        return () => {
            props.data.attribute.unsubscribe(updateValue);
        };
    }, [props.data.attribute]);

    return (
        <AttributeContainer attribute={props.data.attribute}>
            <div className='text-center text-white'>
                <span className='font-semibold'>{value}</span>
                <span className='ml-2 font-bold'>{props.data.attribute.unit}</span>
            </div>
        </AttributeContainer>
    );
};

export default SiDisplayNode;
