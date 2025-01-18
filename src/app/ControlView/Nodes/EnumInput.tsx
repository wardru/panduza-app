import { useState, useCallback } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeShell from '../AttributeShell';
import { AttributeEnum } from '@/app/attribute';

import { useAttributeEnumListener } from '../AttributeListener';

import EnumInputWidget from './Components/EnumInputWidget';

export type EnumInputNode = Node<{
    attribute: AttributeEnum;
}>;

const EnumInputNode: React.FC<NodeProps<EnumInputNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);
    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    const { publish, disabled } = useAttributeEnumListener({
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
            <EnumInputWidget
                value={value}
                disabled={disabled}
                onNewValue={publish}
                choices={props.data?.attribute.choices}
            />
        </AttributeShell>
    );
};

export default EnumInputNode;
