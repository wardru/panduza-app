import { Node, NodeProps } from '@xyflow/react';

import { AttributeNumber } from '@/app/attribute';

import { useAttributeNumberListener } from '../AttributeListener';

import AttributeShell from '../AttributeShell';

import NumberDisplayWidget from './Components/NumberDisplayWidget';

export type NumberDisplayNode = Node<{
    attribute: AttributeNumber;
}>;

const NumberDisplayNode: React.FC<NodeProps<NumberDisplayNode>> = (props) => {
    const { value, isFreshValue, connected } = useAttributeNumberListener({
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
            <NumberDisplayWidget value={value} />
        </AttributeShell>
    );
};

export default NumberDisplayNode;
