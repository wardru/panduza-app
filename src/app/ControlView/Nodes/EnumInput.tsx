import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';
import { AttributeEnum } from '@/app/attribute';

import { useAttributeEnumListener } from '../AttributeListener';

import EnumInput from './Widgets/EnumInput';

export type EnumInputNode = Node<{
    attribute: AttributeEnum;
}>;

const EnumInputNode: React.FC<NodeProps<EnumInputNode>> = (props) => {
    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    const { value, settings, isFreshValue, publish, connected } = useAttributeEnumListener({
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
            <EnumInput
                value={value}
                onNewValue={publish}
                choices={settings.choices}
            />
        </NodeShell>
    );
};

export default EnumInputNode;
