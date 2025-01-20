import { Node, NodeProps } from '@xyflow/react';

import { AttributeBool } from '@/app/attribute';

import { useAttributeBoolListener } from '../AttributeListener';

import AttributeShell from '@/app/ControlView/AttributeShell';

import BooleanButtonWidget from './Components/BooleanButtonWidget';

export type BooleanButtonsNode = Node<{
    attribute: AttributeBool;
}>;

const BooleanButtonsNode: React.FC<NodeProps<BooleanButtonsNode>> = (props) => {
    const { publish, disabled } = useAttributeBoolListener({
        attribute: props.data.attribute,
    });

    return (
        <AttributeShell
            attributeName={props.data?.attribute.name}
            classPath={props.data?.attribute.classPath}
            driverName={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={disabled}
        >
            <div className='flex space-x-4'>
                <BooleanButtonWidget
                    text={'True'}
                    disabled={disabled}
                    onClick={() => publish(true)}
                />
                <BooleanButtonWidget
                    text={'False'}
                    disabled={disabled}
                    onClick={() => publish(false)}
                />
            </div>
        </AttributeShell>
    );
};

export default BooleanButtonsNode;
