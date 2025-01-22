import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';
import { AttributeNumber } from '@/app/attribute';

import { useAttributeNumberListener } from '../AttributeListener';

import NumberSpinner from './Widgets/NumberSpinner';

export type NumberSpinnerNode = Node<{
    attribute: AttributeNumber;
}>;

const NumberSpinnerNode: React.FC<NodeProps<NumberSpinnerNode>> = (props) => {
    const { value, isFreshValue, publish, connected } = useAttributeNumberListener({
        attribute: props.data.attribute,
    });

    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    return (
        <NodeShell
            topLeft={props.data?.attribute.name}
            topRight={props.data?.attribute.classPath}
            bottomRight={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={!connected}
            animateBorder={isFreshValue}
        >
            <NumberSpinner
                value={value}
                onNewValue={publish}
            />
        </NodeShell>
    );
};

export default NumberSpinnerNode;
