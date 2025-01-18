import { useState, useCallback } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeShell from '../AttributeShell';
import { AttributeNumber } from '@/app/attribute';

import { useAttributeNumberListener } from '../AttributeListener';

import NumberSpinnerWidget from './Components/NumberSpinnerWidget';

export type NumberSpinnerNode = Node<{
    attribute: AttributeNumber;
}>;

const NumberSpinnerNode: React.FC<NodeProps<NumberSpinnerNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);

    const { publish, disabled } = useAttributeNumberListener({
        attribute: props.data.attribute,
        onDisconnect: useCallback(() => {
            setValue(0);
        }, []),
        onNewValue: useCallback((value: number) => setValue(value), []),
    });

    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    return (
        <AttributeShell
            attributeName={props.data?.attribute.name}
            classPath={props.data?.attribute.classPath}
            driverName={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={disabled}
        >
            <NumberSpinnerWidget
                value={value}
                disabled={disabled}
                onNewValue={publish}
            />
        </AttributeShell>
    );
};

export default NumberSpinnerNode;
