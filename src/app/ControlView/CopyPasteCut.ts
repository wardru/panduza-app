import { useReactFlow, Node, useStoreApi } from '@xyflow/react';
import { useState, useCallback } from 'react';

import { v4 as uuidv4 } from 'uuid';

export const useCopyPasteCut = () => {
    const { getNodes, setNodes, updateNode, screenToFlowPosition } = useReactFlow();
    const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
    const store = useStoreApi(); // for node sellection/desellection

    const copy = useCallback(() => {
        const selNodes = getNodes().filter((node) => node.selected);
        setSelectedNodes(selNodes);
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
            const minX = Math.min(...selectedNodes.map((s) => s.position.x));
            const minY = Math.min(...selectedNodes.map((s) => s.position.y));

            const newNodes = selectedNodes.map((node) => {
                const id = uuidv4();
                const x = pastePos.x + (node.position.x - minX);
                const y = pastePos.y + (node.position.y - minY);

                return { ...node, id, position: { x, y } };
            });

            // TODO: test alternative addNodes remove other if OK
            addNodes(newNodes);
            //     setNodes((nodes) => [...nodes.map((node) => ({ ...node, selected: false })), ...newNodes]);
        },
        [selectedNodes, screenToFlowPosition, setNodes]
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

    const setInteractivity = (isInteractive: boolean) => {
        store.setState({
            nodesDraggable: isInteractive,
            nodesConnectable: isInteractive,
            elementsSelectable: isInteractive,
        });
    };

    return { copy, paste, cut, selectAll, unselectAll, setControlsLock };
};
