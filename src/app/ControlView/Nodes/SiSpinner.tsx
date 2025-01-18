import { useCallback, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import { AttributeSi, SiSettings } from '@/app/attribute';

import NumberSpinnerWidget from './Components/NumberSpinnerWidget';

import AttributeShell from '../AttributeShell';

import { useAttributeSiListener } from '../AttributeListener';

export type SiSpinnerNode = Node<{
    attribute: AttributeSi;
}>;

const SiSpinnerNode: React.FC<NodeProps<SiSpinnerNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);
    const [siSettings, setSiSettings] = useState<SiSettings>({
        min: props.data?.attribute.min,
        max: props.data?.attribute.max,
        decimals: props.data?.attribute.decimals,
        unit: props.data?.attribute.unit,
    });

    const { disabled, publish } = useAttributeSiListener({
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
            <NumberSpinnerWidget
                value={value}
                disabled={disabled}
                onNewValue={publish}
                min={siSettings.min}
                max={siSettings.max}
                unit={siSettings.unit}
            />
        </AttributeShell>
    );
};

export default SiSpinnerNode;
