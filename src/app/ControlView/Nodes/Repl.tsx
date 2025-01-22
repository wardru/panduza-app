import { Node, NodeProps } from '@xyflow/react';

import { AttributeString } from '@/app/attribute';

import { useAttributeStringListener } from '../AttributeListener';

import NodeShell from '../NodeShell';

import StringInputWidget from './Components/StringInputWidget';

import '@xyflow/react/dist/style.css';

export type ReplNode = Node<{
    commandAttribute: AttributeString;
    responseAttribute: AttributeString;
}>;

const ReplNode: React.FC<NodeProps<ReplNode>> = (props) => {
    const { value: commandValue, publish } = useAttributeStringListener({
        attribute: props.data.commandAttribute,
    });

    const {
        value: responseValue,
        isFreshValue,
        connected,
    } = useAttributeStringListener({
        attribute: props.data.responseAttribute,
    });

    return (
        <>
            <NodeShell
                topLeft={'REPL'}
                topRight={props.data?.commandAttribute.classPath}
                bottomRight={props.data?.commandAttribute.parentDriver}
                selected={props.selected || false}
                disabled={!connected}
                animateBorder={isFreshValue}
            >
                <div className='flex flex-col space-y-3 text-white w-full'>
                    <div className='flex flex-col items-center space-y-1'>
                        <label>Command</label>
                        <StringInputWidget
                            value={commandValue}
                            onNewValue={publish}
                            placeholder='Enter a command'
                        />
                    </div>
                    <div className='flex flex-col items-center space-y-1 w-full'>
                        <label>Response</label>
                        <textarea
                            className='nodrag nowheel nopan text-black rounded-md p-0.5 w-full'
                            readOnly
                            value={responseValue}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            </NodeShell>
        </>
    );
};

export default ReplNode;
