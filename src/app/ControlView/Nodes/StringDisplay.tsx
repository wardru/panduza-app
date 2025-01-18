import { useState, useCallback } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import { AttributeString } from '@/app/attribute';

import AttributeShell from '../AttributeShell';

import { useAttributeStringListener } from '../AttributeListener';

import StringDisplayWidget from './Components/StringDisplayWidget';

export type StringDisplayNode = Node<{
    attribute: AttributeString;
}>;

const StringDisplayNode: React.FC<NodeProps<StringDisplayNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);

    const { disabled } = useAttributeStringListener({
        attribute: props.data.attribute,
        onDisconnect: useCallback(() => {
            setValue('');
        }, []),
        onNewValue: useCallback((value: string) => setValue(value), []),
    });

    return (
        <AttributeShell
            attributeName={props.data?.attribute.name}
            classPath={props.data?.attribute.classPath}
            driverName={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={disabled}
        >
            <StringDisplayWidget value={value} />
        </AttributeShell>
    );
};

export default StringDisplayNode;
