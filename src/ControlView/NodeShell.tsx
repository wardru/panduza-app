import { useControlViewStore } from './UseControlViewStore';

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
    const getNodeColor = useControlViewStore((state) => state.getNodeColor);
    const color: string | undefined = props.bottomRight ? getNodeColor(props.bottomRight) : undefined;

    return (
        <div
            className={`rounded-m flex min-h-[100px] min-w-[210px] flex-col shadow-lg ${props.disabled ? 'pointer-events-none opacity-60' : 'pointer-events-auto'} `}
        >
            <div
                className={` ${props.animateBorder ? 'nodeshell-animated-wrapper' : 'nodeshell-animated-wrapper fade-out'}`}
            >
                <div className='nodeshell-wrapper-content grow'>
                    {/* Header */}
                    <div
                        className='mb-3 flex justify-between rounded-t-md px-2 py-1'
                        style={{ backgroundColor: color }}
                    >
                        <p className='font-bold'>{props.topLeft?.toUpperCase()}</p>
                        <p
                            className='font-light italic'
                            style={{ textTransform: 'capitalize' }}
                        >
                            {props.topRight}
                        </p>
                    </div>
                    {/* Custom Content */}
                    <div className='z-[1000] flex items-center justify-center p-2'>{props.children}</div>
                    {/* Footer */}
                    <div className='flex items-center justify-between px-2 text-right'>
                        <div className={`size-2 rounded-full ${props.disabled ? 'bg-dot-red' : 'bg-dot-green'}`} />
                        <p className='font-light italic'>{props.bottomRight?.toUpperCase()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NodeShell;
