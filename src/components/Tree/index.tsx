import TreeProps from './TreeProps';
import { TreeProvider } from './TreeProvider';
import { TreeBlock } from './TreeBlock';

export const Tree: React.FC<TreeProps> = (props) => {
    return (
        <TreeProvider treeProps={props}>
            <TreeBlock />
        </TreeProvider>
    );
};
