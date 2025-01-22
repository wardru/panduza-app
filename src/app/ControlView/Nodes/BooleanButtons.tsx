import { Node, NodeProps } from '@xyflow/react';

import { AttributeBool } from '@/app/attribute';

import { useAttributeBoolListener } from '../AttributeListener';

import NodeShell from '@/app/ControlView/NodeShell';

import BooleanButton from './Widgets/BooleanButton';

export type BooleanButtonsNode = Node<{
    attribute: AttributeBool;
}>;

const BooleanButtonsNode: React.FC<NodeProps<BooleanButtonsNode>> = (props) => {
    const { publish, connected } = useAttributeBoolListener({
        attribute: props.data.attribute,
    });

    return (
        <NodeShell
            topLeft={props.data?.attribute.name}
            topRight={props.data?.attribute.classPath}
            bottomRight={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={!connected}
        >
            <div className='flex space-x-4'>
                <BooleanButton
                    text={'True'}
                    onClick={() => publish(true)}
                />
                <BooleanButton
                    text={'False'}
                    onClick={() => publish(false)}
                />
            </div>
        </NodeShell>
    );
};

export default BooleanButtonsNode;
