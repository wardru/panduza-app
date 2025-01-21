import { Node, NodeProps } from '@xyflow/react';

import AttributeShell from '../AttributeShell';
import { AttributeSi } from '@/app/attribute';

import { useAttributeSiListener } from '../AttributeListener';
import NumberDisplayWidget from './Components/NumberDisplayWidget';

export type SiDisplayNode = Node<{
    attribute: AttributeSi;
}>;

const SiDisplayNode: React.FC<NodeProps<SiDisplayNode>> = (props) => {
    const { value, settings, isFreshValue, connected } = useAttributeSiListener({
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
            <NumberDisplayWidget
                value={value}
                unit={settings.unit || ''}
            />
        </AttributeShell>
    );
};

export default SiDisplayNode;
