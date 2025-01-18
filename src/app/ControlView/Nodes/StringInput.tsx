import { useState, useCallback } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeShell from '../AttributeShell';
import { AttributeString } from '@/app/attribute';

import { useAttributeStringListener } from '../AttributeListener';

import StringInputWidget from './Components/StringInputWidget';

export type StringInputNode = Node<{
    attribute: AttributeString;
}>;

const StringInputNode: React.FC<NodeProps<StringInputNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);
    //TODO: Implement error handling https://github.com/Panduza/panduza-app/issues/65
    //const [error, setError] = useState<string | null>(null);

    const { publish, disabled } = useAttributeStringListener({
        attribute: props.data.attribute,
        onDisconnect: useCallback(() => {
            setValue('');
        }, []),
        onNewValue: useCallback((value: string) => setValue(value), []),
    });

    return (
        <AttributeShell
            attributeName={props.data?.attribute.name}
            classPath={props.data?.attribute.classPath}
            driverName={props.data?.attribute.parentDriver}
            selected={props.selected || false}
            disabled={disabled}
        >
            <div
                className='flex items-center'
                onClick={(e) => e.stopPropagation()}
            >
                <StringInputWidget
                    value={value}
                    disabled={disabled}
                    placeholder='Enter string'
                    onNewValue={publish}
                />
            </div>
        </AttributeShell>
    );
};

export default StringInputNode;
