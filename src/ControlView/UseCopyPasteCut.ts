import { useState, useCallback } from 'react';

import { useReactFlow, Node, useStoreApi } from '@xyflow/react';

import { v4 as uuidv4 } from 'uuid';

export const useCopyPasteCut = () => {
    const { getNodes, setNodes, updateNode, screenToFlowPosition } = useReactFlow();
    const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
    const store = useStoreApi(); // for node sellection/desellection

    const copy = useCallback(() => {
        const selNodes = getNodes().filter((node) => node.selected);
        setCopiedNodes(selNodes);
    }, [getNodes]);

    const cut = useCallback(() => {
        copy();
        setNodes((nodes) => nodes.filter((node) => !node.selected)); //remove selected nodes
    }, [copy, setNodes]);

    const paste = useCallback(
        (
            mousePos: { x: number; y: number }, // Accept mouse position as an argument
            pastePos = screenToFlowPosition({
                x: mousePos.x,
                y: mousePos.y,
            })
        ) => {
            const minX = Math.min(...copiedNodes.map((s) => s.position.x));
            const minY = Math.min(...copiedNodes.map((s) => s.position.y));

            const newNodes = copiedNodes.map((node) => {
                const id = uuidv4();
                const x = pastePos.x + (node.position.x - minX);
                const y = pastePos.y + (node.position.y - minY);
                node.selected = true; //set new nodes to be selected

                return { ...node, id, position: { x, y } };
            });

            setNodes((nodes) => [...nodes.map((node) => ({ ...node, selected: false })), ...newNodes]); // deselect other and add new nodes
        },
        [copiedNodes, screenToFlowPosition, setNodes]
    );

    /// Select/UnSelect(inspired by https://github.com/xyflow/xyflow/issues/492)
    const selectAll = useCallback(() => {
        store.getState().addSelectedNodes(getNodes().map((node) => node.id));
    }, [store, getNodes]);

    const unselectAll = useCallback(() => {
        getNodes().map((node) => {
            updateNode(node.id, { selected: false });
        });
    }, [getNodes, updateNode]);

    return { copy, paste, cut, selectAll, unselectAll };
};
