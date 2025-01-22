import { Node, NodeProps } from '@xyflow/react';

import { AttributeString } from '@/app/attribute';

import NodeShell from '../NodeShell';

import { useAttributeStringListener } from '../AttributeListener';

import StringDisplay from './Widgets/StringDisplay';

export type StringDisplayNode = Node<{
    attribute: AttributeString;
}>;

const StringDisplayNode: React.FC<NodeProps<StringDisplayNode>> = (props) => {
    const { value, connected, isFreshValue } = useAttributeStringListener({
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
            <StringDisplay value={value} />
        </NodeShell>
    );
};

export default StringDisplayNode;
