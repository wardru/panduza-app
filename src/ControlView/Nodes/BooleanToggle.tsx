import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';
import { useAttributeBoolListener } from '../AttributeListener';

import BooleanToggle from './Widgets/BooleanToggle';

export type BooleanToggleNode = Node<{
    attribute: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
}>;

const BooleanToggleNode: React.FC<NodeProps<BooleanToggleNode>> = (props) => {
    const { publish, connected, isFreshValue, value } = useAttributeBoolListener({
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
            <BooleanToggle
                value={value}
                readOnly={props.data?.attribute.mode === 'RO'}
                onNewValue={publish}
            />
        </NodeShell>
    );
};

export default BooleanToggleNode;
