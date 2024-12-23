import NodeData from './NodeData';
import { useTreeApi } from './TreeProvider';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { Squares2X2Icon, Square3Stack3DIcon } from '@heroicons/react/24/outline';

interface TreeRowProps {
    node: NodeData;
}

export const TreeRow: React.FC<TreeRowProps> = ({ node }) => {
    const tree = useTreeApi();

    const handleChevronClick = (event: React.MouseEvent) => {
        if (!node.children) {
            return;
        }
        event.stopPropagation();
        tree.toggle(node);
    };

    const handleSelectClick = () => {
        tree.select(node);
    };

    return (
        <div
            className='hover:bg-green-900 items-center flex rounded-md mx-2'
            onClick={handleSelectClick}
            style={{ paddingLeft: node.level * 18, backgroundColor: tree.isSelected(node) ? 'blue' : '' }}
        >
            <span
                className='mr-1 flex flex-shrink-0 items-center justify-center size-6'
                onClick={handleChevronClick}
            >
                {node.children ? (
                    tree.isOpen(node) ? (
                        <ChevronDownIcon className='size-3' />
                    ) : (
                        <ChevronRightIcon className='size-3' />
                    )
                ) : null}
            </span>
            <span className='mr-1 flex flex-shrink-0 items-center justify-center size-6'>
                {node.type === 'attribute' && <div className='rounded-full size-1 bg-neutral-300' />}
                {node.type === 'class' && <Square3Stack3DIcon className='size-4' />}
                {node.type === 'driver' && <Squares2X2Icon className='size-4' />}
            </span>
            <label className='text-nowrap'> {node.label} </label>
        </div>
    );
};
