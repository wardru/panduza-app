import { useTreeApi } from './TreeProvider';
import { TreeRow } from './TreeRow';
import { useDndMonitor } from '@dnd-kit/core';

import { useState } from 'react';

export const TreeBlock = () => {
    const tree = useTreeApi();
    const [isDragging, setIsDragging] = useState(false);

    useDndMonitor({
        onDragStart() {
            setIsDragging(true);
        },
        onDragEnd() {
            setIsDragging(false);
        },
        onDragCancel() {
            setIsDragging(false);
        },
    });

    return (
        <div className={`size-full ${isDragging ? 'overflow-hidden' : 'overflow-auto'}`}>
            {tree.visibleNodes.map((node) => (
                <TreeRow
                    key={node.id}
                    node={node}
                />
            ))}
        </div>
    );
};
