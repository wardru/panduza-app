import { Node, NodeProps } from '@xyflow/react';

import { AttributeNumber } from '@/app/attribute';

import { useAttributeNumberListener } from '../AttributeListener';

import NodeShell from '../NodeShell';

import NumberDisplay from './Widgets/NumberDisplay';

export type NumberDisplayNode = Node<{
    attribute: AttributeNumber;
}>;

const NumberDisplayNode: React.FC<NodeProps<NumberDisplayNode>> = (props) => {
    const { value, isFreshValue, connected } = useAttributeNumberListener({
        attribute: props.data.attribute,
    });

    return (
        <NodeShell
            topLeft={props.data?.attribute.name}
            topRight={props.data?.attribute.classPath}
            bottomRight={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={!connected}
            animateBorder={isFreshValue}
        >
            <NumberDisplay value={value} />
        </NodeShell>
    );
};

export default NumberDisplayNode;
