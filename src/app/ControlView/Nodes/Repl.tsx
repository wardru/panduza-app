import { Node, NodeProps } from '@xyflow/react';

import { useAttributeStringListener } from '../AttributeListener';

import NodeShell from '../NodeShell';

import StringInput from './Widgets/StringInput';

import '@xyflow/react/dist/style.css';

export type ReplNode = Node<{
    attributeCommand: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
    attributeResponse: {
        name: string;
        path: string;
        mode: string;
        classPath: string;
        driver: string;
    };
}>;

const ReplNode: React.FC<NodeProps<ReplNode>> = (props) => {
    const { value: commandValue, publish } = useAttributeStringListener({
        path: props.data?.attributeCommand.path,
        mode: props.data?.attributeCommand.mode,
    });

    const {
        value: responseValue,
        isFreshValue,
        connected,
    } = useAttributeStringListener({
        path: props.data?.attributeResponse.path,
        mode: props.data?.attributeResponse.mode,
    });

    return (
        <>
            <NodeShell
                topLeft={'REPL'}
                topRight={props.data?.attributeCommand.classPath}
                bottomRight={props.data?.attributeCommand.driver}
                selected={props.selected || false}
                disabled={!connected}
                animateBorder={isFreshValue}
            >
                <div className='flex flex-col space-y-3 text-white w-full'>
                    <div className='flex flex-col items-center space-y-1'>
                        <label>Command</label>
                        <StringInput
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
