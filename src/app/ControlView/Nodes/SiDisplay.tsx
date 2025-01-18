import { useState, useCallback } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeShell from '../AttributeShell';
import { AttributeSi, SiSettings } from '@/app/attribute';

import { useAttributeSiListener } from '../AttributeListener';
import NumberDisplayWidget from './Components/NumberDisplayWidget';

export type SiDisplayNode = Node<{
    attribute: AttributeSi;
}>;

const SiDisplayNode: React.FC<NodeProps<SiDisplayNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);
    const [siSettings, setSiSettings] = useState<SiSettings>({
        min: props.data?.attribute.min,
        max: props.data?.attribute.max,
        decimals: props.data?.attribute.decimals,
        unit: props.data?.attribute.unit,
    });

    const { disabled } = useAttributeSiListener({
        attribute: props.data.attribute,
        onDisconnect: useCallback(() => {
            setValue(0);
        }, []),
        onNewData: useCallback((value: number, settings: SiSettings) => {
            setValue(value);
            setSiSettings(settings);
        }, []),
    });

    return (
        <AttributeShell
            attributeName={props.data?.attribute.name}
            classPath={props.data?.attribute.classPath}
            driverName={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={disabled}
        >
            <NumberDisplayWidget
                value={value}
                unit={siSettings?.unit || ''}
            />
        </AttributeShell>
    );
};

export default SiDisplayNode;
