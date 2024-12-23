import { useDroppable, useDndMonitor } from '@dnd-kit/core';

import { useState } from 'react';

const ControlPanel: React.FC = () => {
    const { active, isOver, setNodeRef } = useDroppable({
        id: 'controlView',
    });

    const [lastDrop, setLastDrop] = useState<string | null>(null);

    useDndMonitor({
        onDragEnd(event) {
            setLastDrop(event.active.data.current?.label);
        },
    });

    return (
        <div className='h-full w-full bg-neutral-900 relative'>
            <div
                ref={setNodeRef}
                className={`w-48 h-48 absolute top-1/2 left-1/2 transfor ${isOver ? 'bg-yellow-500' : 'bg-yellow-600'} flex flex-col items-center justify-center`}
            >
                {isOver ? (
                    <>
                        <span className='font-bold'>Wanna drop</span>
                        <div>{active?.data.current?.label}</div>?
                    </>
                ) : (
                    <>
                        <label className='font-bold'>Nothing to drop</label>
                        {lastDrop ? <div>Last drop: {lastDrop}</div> : null}
                    </>
                )}
            </div>
        </div>
    );
};

export default ControlPanel;
