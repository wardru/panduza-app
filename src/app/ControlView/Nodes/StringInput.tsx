import { Node, NodeProps } from '@xyflow/react';

import AttributeShell from '../AttributeShell';
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
        <AttributeShell
            attributeName={props.data?.attribute.name}
            classPath={props.data?.attribute.classPath}
            driverName={props.data?.attribute.parentDriver}
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
        </AttributeShell>
    );
};

export default StringInputNode;
