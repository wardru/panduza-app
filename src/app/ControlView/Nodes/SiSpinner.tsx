import { Node, NodeProps } from '@xyflow/react';

import NumberSpinner from './Widgets/NumberSpinner';

import NodeShell from '../NodeShell';

import { useAttributeSiListener } from '../AttributeListener';

export type SiSpinnerNode = Node<{
    attribute: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
}>;

const SiSpinnerNode: React.FC<NodeProps<SiSpinnerNode>> = (props) => {
    const { value, settings, isFreshValue, connected, publish } = useAttributeSiListener({
        path: props.data?.attribute.path,
        mode: props.data?.attribute.mode,
    });

    return (
        <NodeShell
            topLeft={props.data?.attribute.name}
            topRight={props.data?.attribute.classPath}
            bottomRight={props.data?.attribute.driver}
            selected={props.selected || false}
            disabled={!connected}
            animateBorder={isFreshValue}
        >
            <NumberSpinner
                value={value}
                onNewValue={publish}
                min={settings?.min}
                max={settings?.max}
                unit={settings?.unit}
            />
        </NodeShell>
    );
};

export default SiSpinnerNode;
