import { NodeData } from './NodeData';
import { useTreeApi } from './TreeProvider';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

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
            className='hover:bg-green-900 items-center flex'
            onClick={handleSelectClick}
            style={{ paddingLeft: node.level * 16, backgroundColor: tree.isSelected(node) ? 'blue' : '' }}
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
            <label className='text-nowrap'> {node.label} </label>
        </div>
    );
};
