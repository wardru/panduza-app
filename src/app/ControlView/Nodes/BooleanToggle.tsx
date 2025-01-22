import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';
import { AttributeBool } from '@/app/attribute';
import { useAttributeBoolListener } from '../AttributeListener';

import BooleanToggleWidget from './Components/BooleanToggleWidget';

export type BooleanToggleNode = Node<{
    attribute: AttributeBool;
}>;

const BooleanToggleNode: React.FC<NodeProps<BooleanToggleNode>> = (props) => {
    const { value, publish, connected, isFreshValue } = useAttributeBoolListener({
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
            <BooleanToggleWidget
                value={value}
                readOnly={props.data?.attribute.mode === 'RO'}
                onNewValue={publish}
            />
        </NodeShell>
    );
};

export default BooleanToggleNode;
