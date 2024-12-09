import { useEffect, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import ContainerNode from './AttributeContainer';
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
        <ContainerNode attribute={props.data.attribute}>
            <div className='text-center text-white'>
                <span className='font-semibold'>&apos;{value}&apos;</span>
            </div>
        </ContainerNode>
    );
};

export default StringDisplayNode;
