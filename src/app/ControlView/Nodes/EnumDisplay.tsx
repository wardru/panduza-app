import { Node, NodeProps } from '@xyflow/react';

import { AttributeEnum } from '@/app/attribute';

import AttributeShell from '../AttributeShell';

import { useAttributeEnumListener } from '../AttributeListener';

import StringDisplayWidget from './Components/StringDisplayWidget';

export type EnumDisplayNode = Node<{
    attribute: AttributeEnum;
}>;

const EnumDisplayNode: React.FC<NodeProps<EnumDisplayNode>> = (props) => {
    const { value, isFreshValue, connected } = useAttributeEnumListener({
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
            <StringDisplayWidget value={value} />
        </AttributeShell>
    );
};

export default EnumDisplayNode;
