import { useState, useCallback } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeShell from '../AttributeShell';
import { AttributeBool } from '@/app/attribute';
import { useAttributeBoolListener } from '../AttributeListener';

import BooleanToggleWidget from './Components/BooleanToggleWidget';

export type BooleanToggleNode = Node<{
    attribute: AttributeBool;
}>;

const BooleanToggleNode: React.FC<NodeProps<BooleanToggleNode>> = (props) => {
    const [value, setValue] = useState<boolean>(props.data.attribute.value);

    const { publish, disabled } = useAttributeBoolListener({
        attribute: props.data.attribute,
        onDisconnect: useCallback(() => {
            setValue(false);
        }, []),
        onNewValue: useCallback((value: boolean) => setValue(value), []),
    });

    return (
        <AttributeShell
            attributeName={props.data?.attribute.name}
            classPath={props.data?.attribute.classPath}
            driverName={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={disabled}
        >
            <BooleanToggleWidget
                value={value}
                disabled={disabled}
                readOnly={props.data?.attribute.mode === 'RO'}
                onNewValue={publish}
            />
        </AttributeShell>
    );
};

export default BooleanToggleNode;
