interface AttributeShellProps {
    attributeName: string;
    driverName: string;
    classPath: string;
    selected: boolean;
    disabled: boolean;
    children?: React.ReactNode;
}

const AttributeShell: React.FC<AttributeShellProps> = (props) => {
    return (
        <div
            className={`flex flex-col flex-grow rounded-md shadow-lg w-auto min-w-[200px] border-2 bg-gray-800
                ${props.selected ? ' border-blue-500' : 'border-transparent'}
                ${props.disabled ? '  opacity-60' : ''}
                `}
            style={{ pointerEvents: 'all' }}
        >
            {/* Header */}
            <div className='flex justify-between rounded-t-md px-2 py-1 bg-opacity-75 mb-4 bg-orange-500'>
                <p className=' text-white font-bold'>{props.attributeName}</p>
                <span className='text-white italic'>{props.classPath}</span>
            </div>

            {/* Custom Content */}
            <div className='p-2 flex items-center justify-center'>{props.children}</div>

            {/* Footer */}
            <div className='flex justify-between items-center px-2 text-right'>
                <div className={`rounded-full size-2 ${props.disabled ? 'bg-red-600' : 'bg-green-500'}`} />
                <span className='text-white'>{props.driverName}</span>
            </div>
        </div>
    );
};

export default AttributeShell;
