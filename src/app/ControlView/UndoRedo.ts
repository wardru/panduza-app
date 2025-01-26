import { useCallback, useState } from 'react';
import { Node, useReactFlow } from '@xyflow/react';

type UseUndoRedoOptions = {
    maxHistorySize: number;
};

const defaultOptions: UseUndoRedoOptions = {
    maxHistorySize: 100,
};

type UseUndoRedo = (options?: UseUndoRedoOptions) => {
    undo: () => void;
    redo: () => void;
    takeSnapshot: () => void;
    canUndo: boolean;
    canRedo: boolean;
};

type HistoryItem = {
    nodes: Node[];
};

// https://redux.js.org/usage/implementing-undo-history
export const useUndoRedo: UseUndoRedo = ({ maxHistorySize = defaultOptions.maxHistorySize } = defaultOptions) => {
    // the past and future arrays store the states that we can jump to
    const [past, setPast] = useState<HistoryItem[]>([]);
    const [future, setFuture] = useState<HistoryItem[]>([]);
    const { setNodes, getNodes } = useReactFlow();

    const takeSnapshot = useCallback(() => {
        // push the current graph to the past state
        setPast((past) => [...past.slice(past.length - maxHistorySize + 1, past.length), { nodes: getNodes() }]);

        // whenever we take a new snapshot, the redo operations need to be cleared to avoid state mismatches
        setFuture([]);
    }, [getNodes, maxHistorySize]);

    const undo = useCallback(() => {
        // get the last state that we want to go back to
        const pastState = past[past.length - 1];

        if (pastState) {
            // first we remove the state from the history
            setPast((past) => past.slice(0, past.length - 1));
            // we store the current graph for the redo operation
            setFuture((future) => [...future, { nodes: getNodes() }]);
            // now we can set the graph to the past state
            setNodes(pastState.nodes);
        }
    }, [setNodes, getNodes, past]);

    const redo = useCallback(() => {
        const futureState = future[future.length - 1];

        if (futureState) {
            setFuture((future) => future.slice(0, future.length - 1));
            setPast((past) => [...past, { nodes: getNodes() }]);
            setNodes(futureState.nodes);
        }
    }, [setNodes, getNodes, future]);

    return {
        undo,
        redo,
        takeSnapshot,
        canUndo: !past.length,
        canRedo: !future.length,
    };
};

export default useUndoRedo;
