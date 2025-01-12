import AttributeContainer from './AttributeContainer';

import { Node, NodeProps } from '@xyflow/react';

import { AttributeBool } from '@/app/attribute';

export type ButtonNode = Node<{
    attribute: AttributeBool;
}>;

const ButtonNode: React.FC<NodeProps<ButtonNode>> = (props) => {
    return (
        <AttributeContainer
            attribute={props.data.attribute}
            nodeProps={props}
        >
            <div className='flex items-center'>
                <input
                    type='button'
                    className='nodrag nopan nowheel text-black bg-white px-2 py-1 rounded-xl flex-1 text-center'
                    value={props.data.attribute.name}
                />
            </div>
        </AttributeContainer>
    );
};

export default ButtonNode;
