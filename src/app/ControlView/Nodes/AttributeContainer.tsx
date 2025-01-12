import { Attribute } from '@/app/attribute';

import { NodeProps } from '@xyflow/react';

interface AttributeContainerProps {
    attribute: Attribute;
    children: React.ReactNode;
    nodeProps: NodeProps;
}

const AttributeContainer: React.FC<AttributeContainerProps> = (props) => {
    return (
        <div
            className={` fill-mode-forwards flex flex-col flex-grow bg-gray-800 rounded-md shadow-lg w-auto min-w-[200px] border-2 ${
                props.nodeProps.selected ? ' border-blue-500' : 'border-transparent'
            } `}
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
                <span className='text-white underline'>{props.attribute.parentDriver}</span>
            </div>
        </div>
    );
};

export default AttributeContainer;
