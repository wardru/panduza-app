import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';

import { useAttributeNumberListener } from '../AttributeListener';

import NumberSpinner from './Widgets/NumberSpinner';

export type NumberSpinnerNode = Node<{
    attribute: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
}>;

const NumberSpinnerNode: React.FC<NodeProps<NumberSpinnerNode>> = (props) => {
    const { value, isFreshValue, publish, connected } = useAttributeNumberListener({
        path: props.data?.attribute.path,
        mode: props.data?.attribute.mode,
    });

    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

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
            />
        </NodeShell>
    );
};

export default NumberSpinnerNode;
