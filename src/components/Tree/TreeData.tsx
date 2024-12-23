export default interface TreeData {
    id: string;
    label: string;
    type: string;
    children?: TreeData[];
}
