import TreeProps from './TreeProps';
import TreeData from './TreeData';
import NodeData from './NodeData';
import { TreeState, Action } from './TreeState';

export class TreeApi {
    rootNodes: NodeData[];
    visibleNodes: NodeData[];

    constructor(
        public tree: TreeProps,
        public state: TreeState,
        public dispatch: React.Dispatch<Action>
    ) {
        this.rootNodes = this.createNodes();
        this.visibleNodes = this.createVisibleNodesList();
    }

    createVisibleNodesList() {
        const nodes: NodeData[] = [];

        const addNodeToVisibles = (node: NodeData) => {
            nodes.push(node);

            if (node.children && this.isOpen(node)) node.children?.forEach(addNodeToVisibles);
        };

        this.rootNodes.map((node) => {
            addNodeToVisibles(node);
        });

        return nodes;
    }

    open(node: NodeData) {
        this.dispatch({ type: 'open', id: node.id });
    }

    close(node: NodeData) {
        this.dispatch({ type: 'close', id: node.id });
    }

    toggle(node: NodeData) {
        return this.isOpen(node) ? this.close(node) : this.open(node);
    }

    isOpen(node: NodeData) {
        return this.state.open[node.id];
    }

    select(node: NodeData) {
        if (!this.isSelected(node)) {
            this.dispatch({ type: 'select', id: node.id });
            if (this.tree.onSelect) this.tree.onSelect(node.id);
        }
    }

    isSelected(node: NodeData) {
        return this.state.selected === node.id;
    }

    createNodes() {
        const nodes: NodeData[] = [];

        this.tree.items.map((item) => {
            nodes.push(this.createNode(item, null, 0));
        });

        return nodes;
    }

    createNode(item: TreeData, parent: NodeData | null, level: number) {
        const { id, label, children } = item;

        const node: NodeData = { tree: this, id, label, level, parent, children: null };

        if (children) {
            node.children = children.map((child) => {
                return this.createNode(child, node, level + 1);
            });
        }

        return node;
    }
}
