import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';
import { AttributeSi } from '@/app/attribute';

import { useAttributeSiListener } from '../AttributeListener';
import NumberDisplay from './Widgets/NumberDisplay';

export type SiDisplayNode = Node<{
    attribute: AttributeSi;
}>;

const SiDisplayNode: React.FC<NodeProps<SiDisplayNode>> = (props) => {
    const { value, settings, isFreshValue, connected } = useAttributeSiListener({
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
            <NumberDisplay
                value={value}
                unit={settings.unit || ''}
            />
        </NodeShell>
    );
};

export default SiDisplayNode;
