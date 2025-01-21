import { Node, NodeProps } from '@xyflow/react';

import AttributeShell from '../AttributeShell';
import { AttributeEnum } from '@/app/attribute';

import { useAttributeEnumListener } from '../AttributeListener';

import EnumInputWidget from './Components/EnumInputWidget';

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
        <AttributeShell
            attributeName={props.data?.attribute.name}
            classPath={props.data?.attribute.classPath}
            driverName={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={!connected}
            animateBorder={isFreshValue}
        >
            <EnumInputWidget
                value={value}
                onNewValue={publish}
                choices={settings.choices}
            />
        </AttributeShell>
    );
};

export default EnumInputNode;
