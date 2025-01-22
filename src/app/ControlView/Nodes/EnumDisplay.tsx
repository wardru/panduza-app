import { Node, NodeProps } from '@xyflow/react';

import { AttributeEnum } from '@/app/attribute';

import NodeShell from '../NodeShell';

import { useAttributeEnumListener } from '../AttributeListener';

import StringDisplay from './Widgets/StringDisplay';

export type EnumDisplayNode = Node<{
    attribute: AttributeEnum;
}>;

const EnumDisplayNode: React.FC<NodeProps<EnumDisplayNode>> = (props) => {
    const { value, isFreshValue, connected } = useAttributeEnumListener({
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

export default EnumDisplayNode;
