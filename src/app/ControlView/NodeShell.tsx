interface NodeShellProps {
    topLeft: string | undefined;
    topRight: string | undefined;
    bottomRight: string | undefined;
    selected: boolean;
    animateBorder?: boolean;
    disabled: boolean;
    children?: React.ReactNode;
}

const NodeShell = (props: NodeShellProps) => {
    return (
        <div
            className={`flex flex-col flex-grow rounded-md shadow-lg  min-w-[200px] min-h-[100px] border-2 bg-transparent
                ${props.selected ? ' border-blue-500' : 'border-transparent'}
                ${props.disabled ? '  opacity-60 pointer-events-none' : 'pointer-events-auto'}
                `}
        >
            <div
                className={` ${props.animateBorder ? 'nodeshell-animated-wrapper' : 'nodeshell-animated-wrapper fade-out'}`}
            >
                <div className='flex-grow nodeshell-wrapper-content'>
                    {/* Header */}
                    {}{' '}
                    <div className='flex justify-between rounded-t-md px-2 py-1 bg-opacity-75 mb-4 bg-orange-500'>
                        <p className=' text-white font-bold'>{props.topLeft}</p>
                        <span className='text-white italic'>{props.topRight}</span>
                    </div>
                    {/* Custom Content */}
                    <div className='p-2 flex items-center justify-center'>{props.children}</div>
                    {/* Footer */}
                    <div className='text-white flex justify-between items-center px-2 text-right'>
                        <div className={`rounded-full size-2 ${props.disabled ? 'bg-red-600' : 'bg-green-500'}`} />
                        <span className='text-white'>{props.bottomRight}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NodeShell;
