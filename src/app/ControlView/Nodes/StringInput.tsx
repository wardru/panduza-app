import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';
import { AttributeString } from '@/app/attribute';

import { useAttributeStringListener } from '../AttributeListener';

import StringInputWidget from './Components/StringInputWidget';

export type StringInputNode = Node<{
    attribute: AttributeString;
}>;

const StringInputNode: React.FC<NodeProps<StringInputNode>> = (props) => {
    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    const { value, isFreshValue, publish, connected } = useAttributeStringListener({
        attribute: props.data.attribute,
    });

    return (
        <NodeShell
            topLeft={props.data?.attribute.name}
            topRight={props.data?.attribute.classPath}
            bottomRight={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={!connected}
            animateBorder={isFreshValue}
        >
            <div
                className='flex items-center'
                onClick={(e) => e.stopPropagation()}
            >
                <StringInputWidget
                    value={value}
                    placeholder='Enter a string'
                    onNewValue={publish}
                />
            </div>
        </NodeShell>
    );
};

export default StringInputNode;
