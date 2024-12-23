import { TreeApi } from './TreeApi';

export default interface NodeData {
    id: string;
    label: string;
    type: string;
    tree: TreeApi;
    level: number;
    parent: NodeData | null;
    children: NodeData[] | null;
}
