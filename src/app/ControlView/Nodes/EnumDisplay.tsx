import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';

import { useAttributeEnumListener } from '../AttributeListener';

import StringDisplay from './Widgets/StringDisplay';

export type EnumDisplayNode = Node<{
    attribute: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
}>;

const EnumDisplayNode: React.FC<NodeProps<EnumDisplayNode>> = (props) => {
    const { value, isFreshValue, connected } = useAttributeEnumListener({
        path: props.data?.attribute.path,
        mode: props.data?.attribute.mode,
    });

    return (
        <NodeShell
            topLeft={props.data?.attribute.name}
            topRight={props.data?.attribute.classPath}
            bottomRight={props.data?.attribute.driver}
            selected={props.selected || false}
            disabled={!connected}
            animateBorder={isFreshValue}
        >
            <StringDisplay value={value} />
        </NodeShell>
    );
};

export default EnumDisplayNode;
