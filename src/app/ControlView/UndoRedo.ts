import { useCallback, useEffect, useState } from 'react';
import { Node, useReactFlow } from '@xyflow/react';

type UseUndoRedoOptions = {
    maxHistorySize: number;
    enableShortcuts: boolean;
    shortcutKey: string;
};

const defaultOptions: UseUndoRedoOptions = {
    maxHistorySize: 100,
    enableShortcuts: true,
    shortcutKey: 'z',
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
export const useUndoRedo: UseUndoRedo = ({
    maxHistorySize = defaultOptions.maxHistorySize,
    enableShortcuts = defaultOptions.enableShortcuts,
    shortcutKey = defaultOptions.shortcutKey,
} = defaultOptions) => {
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

    useEffect(() => {
        // this effect is used to attach the global event handlers
        if (!enableShortcuts) {
            return;
        }

        const keyDownHandler = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase(); // when shift is pressed z => Z same with capslock so lowercase fixes all these edge cases
            if (key === shortcutKey && (event.ctrlKey || event.metaKey) && event.shiftKey) {
                redo();
            } else if (key === shortcutKey && (event.ctrlKey || event.metaKey)) {
                undo();
            }
        };

        window.addEventListener('keydown', keyDownHandler);

        return () => {
            window.removeEventListener('keydown', keyDownHandler);
        };
    }, [undo, redo, enableShortcuts, shortcutKey]);

    return {
        undo,
        redo,
        takeSnapshot,
        canUndo: !past.length,
        canRedo: !future.length,
    };
};

export default useUndoRedo;
