import { useTreeApi } from './TreeProvider';
import { TreeRow } from './TreeRow';

export const TreeBlock = () => {
    const tree = useTreeApi();

    return (
        <div>
            <div>
                {tree.visibleNodes.map((node) => (
                    <TreeRow
                        key={node.id}
                        node={node}
                    />
                ))}
            </div>
        </div>
    );
};
