import { Node, NodeProps } from '@xyflow/react';

import { AttributeSi } from '@/app/attribute';

import NumberSpinnerWidget from './Components/NumberSpinnerWidget';

import AttributeShell from '../AttributeShell';

import { useAttributeSiListener } from '../AttributeListener';

export type SiSpinnerNode = Node<{
    attribute: AttributeSi;
}>;

const SiSpinnerNode: React.FC<NodeProps<SiSpinnerNode>> = (props) => {
    const { value, settings, isFreshValue, connected, publish } = useAttributeSiListener({
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
            <NumberSpinnerWidget
                value={value}
                onNewValue={publish}
                min={settings.min}
                max={settings.max}
                unit={settings.unit}
            />
        </AttributeShell>
    );
};

export default SiSpinnerNode;
