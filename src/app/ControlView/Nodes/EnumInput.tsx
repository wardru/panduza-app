import { Node, NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';

import { useAttributeEnumListener } from '../AttributeListener';

import EnumInput from './Widgets/EnumInput';

export type EnumInputNode = Node<{
    attribute: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
}>;

const EnumInputNode: React.FC<NodeProps<EnumInputNode>> = (props) => {
    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    const { value, settings, isFreshValue, publish, connected } = useAttributeEnumListener({
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
            <EnumInput
                value={value}
                onNewValue={publish}
                choices={settings?.choices}
            />
        </NodeShell>
    );
};

export default EnumInputNode;
