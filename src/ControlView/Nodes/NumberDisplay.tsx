import { Node, NodeProps } from '@xyflow/react';

import { useAttributeNumberListener } from '../AttributeListener';

import NodeShell from '../NodeShell';

import NumberDisplay from './Widgets/NumberDisplay';

export type NumberDisplayNode = Node<{
    attribute: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
}>;

const NumberDisplayNode: React.FC<NodeProps<NumberDisplayNode>> = (props) => {
    const { value, isFreshValue, connected } = useAttributeNumberListener({
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
            <NumberDisplay value={value} />
        </NodeShell>
    );
};

export default NumberDisplayNode;
