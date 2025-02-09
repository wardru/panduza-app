import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';

import { useAttributeStringListener } from '../AttributeListener';

import StringInput from './Widgets/StringInput';

export type StringInputNode = Node<{
    attribute: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
}>;

const StringInputNode: React.FC<NodeProps<StringInputNode>> = (props) => {
    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    const { value, isFreshValue, publish, connected } = useAttributeStringListener({
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
            <div
                className='flex items-center'
                onClick={(e) => e.stopPropagation()}
            >
                <StringInput
                    value={value}
                    placeholder='Enter a string'
                    onNewValue={publish}
                />
            </div>
        </NodeShell>
    );
};

export default StringInputNode;
