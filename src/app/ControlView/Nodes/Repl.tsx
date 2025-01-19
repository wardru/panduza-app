import { useState, useCallback } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import { AttributeString } from '@/app/attribute';

import { useAttributeStringListener } from '../AttributeListener';

import AttributeShell from '../AttributeShell';

import StringInputWidget from './Components/StringInputWidget';

import '@xyflow/react/dist/style.css';

export type ReplNode = Node<{
    commandAttribute: AttributeString;
    responseAttribute: AttributeString;
}>;

const ReplNode: React.FC<NodeProps<ReplNode>> = (props) => {
    const [commandValue, setCommandValue] = useState(props.data.commandAttribute.value);
    const [responseValue, setResponseValue] = useState(props.data.responseAttribute.value);

    const commandListener = useAttributeStringListener({
        attribute: props.data.commandAttribute,
        onDisconnect: useCallback(() => {
            setCommandValue('');
        }, []),
        onNewValue: useCallback((value: string) => setCommandValue(value), []),
    });

    useAttributeStringListener({
        attribute: props.data.responseAttribute,
        onDisconnect: useCallback(() => {
            setResponseValue('');
        }, []),
        onNewValue: useCallback((value: string) => setResponseValue(value), []),
    });

    return (
        <>
            <AttributeShell
                attributeName={'REPL'}
                classPath={props.data?.commandAttribute.classPath}
                driverName={props.data?.commandAttribute.parentDriver}
                selected={props.selected || false}
                disabled={commandListener.disabled}
            >
                <div className='flex flex-col space-y-3 text-white'>
                    <div className='flex flex-col items-center space-y-1'>
                        <label>Command</label>
                        <StringInputWidget
                            value={commandValue}
                            disabled={commandListener.disabled}
                            onNewValue={commandListener.publish}
                            placeholder='Enter a command'
                        />
                    </div>
                    <div className='flex flex-col items-center space-y-1'>
                        <label>Response</label>
                        <textarea
                            className='nodrag nopan nowheel text-black rounded-md p-0.5 w-full'
                            readOnly
                            value={responseValue}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            </AttributeShell>
        </>
    );
};

export default ReplNode;
