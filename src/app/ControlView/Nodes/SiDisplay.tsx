import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';

import { useAttributeSiListener } from '../AttributeListener';
import NumberDisplay from './Widgets/NumberDisplay';

export type SiDisplayNode = Node<{
    attribute: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
}>;

const SiDisplayNode: React.FC<NodeProps<SiDisplayNode>> = (props) => {
    const { value, settings, isFreshValue, connected } = useAttributeSiListener({
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
            <NumberDisplay
                value={value}
                unit={settings?.unit}
            />
        </NodeShell>
    );
};

export default SiDisplayNode;
