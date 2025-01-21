import { Node, NodeProps } from '@xyflow/react';

import AttributeShell from '../AttributeShell';
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
        <AttributeShell
            attributeName={props.data?.attribute.name}
            classPath={props.data?.attribute.classPath}
            driverName={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={!connected}
            animateBorder={isFreshValue}
        >
            <BooleanToggleWidget
                value={value}
                readOnly={props.data?.attribute.mode === 'RO'}
                onNewValue={publish}
            />
        </AttributeShell>
    );
};

export default BooleanToggleNode;
