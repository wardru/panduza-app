export default interface TreeData {
    id: string;
    label: string;
    type: string;
    attributeType?: string;
    children?: TreeData[];
}
