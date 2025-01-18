import { useState, useCallback } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import { AttributeEnum } from '@/app/attribute';

import AttributeShell from '../AttributeShell';

import { useAttributeEnumListener } from '../AttributeListener';

import StringDisplayWidget from './Components/StringDisplayWidget';

export type EnumDisplayNode = Node<{
    attribute: AttributeEnum;
}>;

const EnumDisplayNode: React.FC<NodeProps<EnumDisplayNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);

    const { disabled } = useAttributeEnumListener({
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

export default EnumDisplayNode;
