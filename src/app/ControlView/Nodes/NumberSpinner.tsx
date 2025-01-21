import { Node, NodeProps } from '@xyflow/react';

import AttributeShell from '../AttributeShell';
import { AttributeNumber } from '@/app/attribute';

import { useAttributeNumberListener } from '../AttributeListener';

import NumberSpinnerWidget from './Components/NumberSpinnerWidget';

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
            />
        </AttributeShell>
    );
};

export default NumberSpinnerNode;
