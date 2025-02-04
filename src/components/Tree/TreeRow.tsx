import NodeData from './NodeData';
import { useTreeApi } from './TreeProvider';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { Squares2X2Icon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { useDraggable } from '@dnd-kit/core';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

import { ContextMenu, useContextMenu } from '../../components/ContextMenu';

interface TreeRowProps {
    node: NodeData;
}

export const TreeRow: React.FC<TreeRowProps> = ({ node }) => {
    const tree = useTreeApi();
    const { show, setContextMenuRef } = useContextMenu();
    const { attributes, listeners, isDragging, setNodeRef } = useDraggable({
        id: node.id,
        data: {
            path: node.id,
            type: node.type,
            label: node.label,
        },
    });

    const handleChevronClick = (event: React.MouseEvent) => {
        if (!node.children) return;
        event.stopPropagation();
        tree.toggle(node);
    };

    const handleSelectClick = () => tree.select(node);

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        tree.select(node);
        show(event, [
            {
                label: 'Copy xtopic',
                action: () => writeText(node.id),
            },
        ]);
    };

    return (
        <>
            <div
                className={`my-0.5 mr-3 ml-1 flex items-center rounded-md py-0.5 outline-hidden ${tree.isSelected(node) ? 'bg-active' : 'bg-transparent hover:bg-[#495258]'} `}
                onClick={handleSelectClick}
                onContextMenu={handleContextMenu}
                style={{
                    paddingLeft: node.level * 18,
                    cursor: isDragging ? 'grabbing' : 'auto',
                }}
                ref={setNodeRef}
                {...attributes}
                {...listeners}
            >
                <span
                    className='mr-1 flex size-6 shrink-0 items-center justify-center'
                    onClick={handleChevronClick}
                >
                    {node.children &&
                        (tree.isOpen(node) ? (
                            <ChevronDownIcon className='size-3' />
                        ) : (
                            <ChevronRightIcon className='size-3' />
                        ))}
                </span>
                <span className='mr-1 flex size-6 shrink-0 items-center justify-center'>
                    {node.type === 'attribute' && <div className='bg-primary size-1 rounded-full' />}
                    {node.type === 'class' && <Square3Stack3DIcon className='size-4' />}
                    {node.type === 'driver' && <Squares2X2Icon className='size-4' />}
                </span>
                {node.type === 'attribute' && <label style={{ textTransform: 'capitalize' }}>{node.label}</label>}
                {node.type === 'class' && <label style={{ textTransform: 'capitalize' }}>{node.label}</label>}
                {node.type === 'driver' && <label>{node.label.toUpperCase()}</label>}
            </div>

            <ContextMenu ref={setContextMenuRef} />
        </>
    );
};
