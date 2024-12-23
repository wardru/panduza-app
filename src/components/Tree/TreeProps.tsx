import TreeData from './TreeData';

export default interface TreeProps {
    items: TreeData[];
    openByDefault?: boolean;

    onSelect?: (id: string) => void;
}
