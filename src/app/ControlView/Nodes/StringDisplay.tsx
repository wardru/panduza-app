import { Node, NodeProps } from '@xyflow/react';

import { AttributeString } from '@/app/attribute';

import AttributeShell from '../AttributeShell';

import { useAttributeStringListener } from '../AttributeListener';

import StringDisplayWidget from './Components/StringDisplayWidget';

export type StringDisplayNode = Node<{
    attribute: AttributeString;
}>;

const StringDisplayNode: React.FC<NodeProps<StringDisplayNode>> = (props) => {
    const { value, connected, isFreshValue } = useAttributeStringListener({
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

export default StringDisplayNode;
