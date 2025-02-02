import { Node, NodePositionChange, XYPosition } from '@xyflow/react';

type GetHelperLinesResult = {
    horizontal?: number;
    vertical?: number;
    snapPosition: Partial<XYPosition>;
};

// this utility function can be called with a position change (inside onNodesChange)
// it checks all other nodes and calculated the helper line positions and the position where the current node should snap to

export const useHelperLines = () => {
    function getHelperLines(change: NodePositionChange, nodes: Node[], distance = 5): GetHelperLinesResult {
        const defaultResult = {
            horizontal: undefined,
            vertical: undefined,
            snapPosition: { x: undefined, y: undefined },
        };
        const nodeA = nodes.find((node) => node.id === change.id);

        if (!nodeA || !change.position || !nodeA.measured?.height || !nodeA.measured?.width) {
            return defaultResult;
        }

        const nodeABounds = {
            left: change.position.x,
            right: change.position.x + nodeA.measured.width,
            top: change.position.y,
            bottom: change.position.y + nodeA.measured.height,
            width: nodeA.measured.width,
            height: nodeA.measured.height,
        };

        let horizontalDistance = distance;
        let verticalDistance = distance;

        return nodes
            .filter((node) => node.id !== nodeA.id)
            .reduce<GetHelperLinesResult>((result, nodeB) => {
                if (!nodeB.measured?.height || !nodeB.measured?.width) {
                    return result;
                }

                const nodeBBounds = {
                    left: nodeB.position.x,
                    right: nodeB.position.x + nodeB.measured.width,
                    top: nodeB.position.y,
                    bottom: nodeB.position.y + nodeB.measured.height,
                    width: nodeB.measured.width,
                    height: nodeB.measured.height,
                };

                //  |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     A     |
                //  |___________|
                //  |
                //  |
                //  |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     B     |
                //  |___________|
                const distanceLeftLeft = Math.abs(nodeABounds.left - nodeBBounds.left);

                if (distanceLeftLeft < verticalDistance) {
                    result.snapPosition.x = nodeBBounds.left;
                    result.vertical = nodeBBounds.left;
                    verticalDistance = distanceLeftLeft;
                }

                //  |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     A     |
                //  |___________|
                //              |
                //              |
                //  |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     B     |
                //  |___________|
                const distanceRightRight = Math.abs(nodeABounds.right - nodeBBounds.right);

                if (distanceRightRight < verticalDistance) {
                    result.snapPosition.x = nodeBBounds.right - nodeABounds.width;
                    result.vertical = nodeBBounds.right;
                    verticalDistance = distanceRightRight;
                }

                //              |‾‾‾‾‾‾‾‾‾‾‾|
                //              |     A     |
                //              |___________|
                //              |
                //              |
                //  |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     B     |
                //  |___________|
                const distanceLeftRight = Math.abs(nodeABounds.left - nodeBBounds.right);

                if (distanceLeftRight < verticalDistance) {
                    result.snapPosition.x = nodeBBounds.right;
                    result.vertical = nodeBBounds.right;
                    verticalDistance = distanceLeftRight;
                }

                //  |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     A     |
                //  |___________|
                //              |
                //              |
                //              |‾‾‾‾‾‾‾‾‾‾‾|
                //              |     B     |
                //              |___________|
                const distanceRightLeft = Math.abs(nodeABounds.right - nodeBBounds.left);

                if (distanceRightLeft < verticalDistance) {
                    result.snapPosition.x = nodeBBounds.left - nodeABounds.width;
                    result.vertical = nodeBBounds.left;
                    verticalDistance = distanceRightLeft;
                }

                //  |‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾|‾‾‾‾‾‾‾‾‾‾‾|
                //  |     A     |     |     B     |
                //  |___________|     |___________|
                const distanceTopTop = Math.abs(nodeABounds.top - nodeBBounds.top);

                if (distanceTopTop < horizontalDistance) {
                    result.snapPosition.y = nodeBBounds.top;
                    result.horizontal = nodeBBounds.top;
                    horizontalDistance = distanceTopTop;
                }

                //  |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     A     |
                //  |___________|_________________
                //                    |           |
                //                    |     B     |
                //                    |___________|
                const distanceBottomTop = Math.abs(nodeABounds.bottom - nodeBBounds.top);

                if (distanceBottomTop < horizontalDistance) {
                    result.snapPosition.y = nodeBBounds.top - nodeABounds.height;
                    result.horizontal = nodeBBounds.top;
                    horizontalDistance = distanceBottomTop;
                }

                //  |‾‾‾‾‾‾‾‾‾‾‾|     |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     A     |     |     B     |
                //  |___________|_____|___________|
                const distanceBottomBottom = Math.abs(nodeABounds.bottom - nodeBBounds.bottom);

                if (distanceBottomBottom < horizontalDistance) {
                    result.snapPosition.y = nodeBBounds.bottom - nodeABounds.height;
                    result.horizontal = nodeBBounds.bottom;
                    horizontalDistance = distanceBottomBottom;
                }

                //                    |‾‾‾‾‾‾‾‾‾‾‾|
                //                    |     B     |
                //                    |           |
                //  |‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
                //  |     A     |
                //  |___________|
                const distanceTopBottom = Math.abs(nodeABounds.top - nodeBBounds.bottom);

                if (distanceTopBottom < horizontalDistance) {
                    result.snapPosition.y = nodeBBounds.bottom;
                    result.horizontal = nodeBBounds.bottom;
                    horizontalDistance = distanceTopBottom;
                }

                //  |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     A     |
                //  |___________|
                //        |
                //        |
                //  |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     B     |
                //  |___________|
                const distanceVerticalCenter = Math.abs(
                    nodeABounds.left + nodeABounds.width / 2.0 - (nodeBBounds.left + nodeBBounds.width / 2.0)
                );

                if (distanceVerticalCenter < verticalDistance) {
                    result.snapPosition.x = nodeBBounds.left + nodeBBounds.width / 2.0 - nodeABounds.width / 2.0;
                    result.vertical = nodeBBounds.left + nodeBBounds.width / 2.0;
                    verticalDistance = distanceVerticalCenter;
                }

                //  |‾‾‾‾‾‾‾‾‾‾‾|     |‾‾‾‾‾‾‾‾‾‾‾|
                //  |     A     |-----|     B     |
                //  |___________|     |___________|
                const distanceHorizontalCenter = Math.abs(
                    nodeABounds.top + nodeABounds.height / 2.0 - (nodeBBounds.top + nodeBBounds.height / 2.0)
                );

                if (distanceHorizontalCenter < horizontalDistance) {
                    result.snapPosition.y = nodeBBounds.top + nodeBBounds.height / 2.0 - nodeABounds.height / 2.0;
                    result.horizontal = nodeBBounds.top + nodeBBounds.height / 2.0;
                    horizontalDistance = distanceHorizontalCenter;
                }

                return result;
            }, defaultResult);
    }
    return { getHelperLines };
};
