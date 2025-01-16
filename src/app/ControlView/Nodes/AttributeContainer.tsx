import { Attribute } from '@/app/attribute';
import { usePlatform, ConnectionState } from '@/app/platform';

import { NodeProps } from '@xyflow/react';

interface AttributeContainerProps {
    attribute: Attribute;
    children: React.ReactNode;
    nodeProps: NodeProps;
}

const AttributeContainer: React.FC<AttributeContainerProps> = (props) => {
    //     const [connected, setConnected] = useState(props.);
    const platform = usePlatform();

    return (
        <div
            className={`flex flex-col flex-grow rounded-md shadow-lg w-auto min-w-[200px] border-2 ${
                props.nodeProps.selected ? ' border-blue-500' : 'border-transparent'
            } ${platform.connectionState === ConnectionState.Connected ? ' bg-gray-800 ' : ' bg-slate-800 '} `}
            style={{ pointerEvents: `${platform.connectionState === ConnectionState.Connected ? 'all' : 'none'}` }}
        >
            {/* Header */}
            <div className='flex justify-between rounded-t-md px-2 py-1 bg-opacity-75 mb-4 bg-orange-500'>
                <span className='text-white font-bold'>{props.attribute.name}</span>
                <span className='text-white italic'>{props.attribute.parentClasses.join('/')}</span>
            </div>

            {/* Custom Content */}
            <div className='p-2 flex-grow'>{props.children}</div>

            {/* Footer */}
            <div className='p-2 text-right'>
                {platform.connectionState === ConnectionState.Connected ? (
                    <div className='rounded-full size-2 bg-green-600' />
                ) : (
                    <div className='rounded-full size-2 bg-red-600' />
                )}
                <span className='text-white underline'>{props.attribute.parentDriver}</span>
            </div>
        </div>
    );
};

export default AttributeContainer;
