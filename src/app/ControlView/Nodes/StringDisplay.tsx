import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';

import { useAttributeStringListener } from '../AttributeListener';

import StringDisplay from './Widgets/StringDisplay';

export type StringDisplayNode = Node<{
    attribute: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
}>;

const StringDisplayNode: React.FC<NodeProps<StringDisplayNode>> = (props) => {
    const { value, connected, isFreshValue } = useAttributeStringListener({
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
            <StringDisplay
                rows={1}
                value={value}
            />
        </NodeShell>
    );
};

export default StringDisplayNode;
