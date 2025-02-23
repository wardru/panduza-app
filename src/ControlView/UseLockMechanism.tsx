import { useEffect } from 'react';

import { useStoreApi } from '@xyflow/react';

interface LockMechanismProps {
    locked: boolean;
    onLocked?: (state: boolean) => void;
}

const useLockMechanism = (props: LockMechanismProps) => {
    const store = useStoreApi();
    const { locked, onLocked } = props;

    useEffect(() => {
        store.setState({
            nodesDraggable: !locked,
            nodesConnectable: !locked,
            elementsSelectable: !locked,
        });

        onLocked?.(locked);
    }, [locked, onLocked]);
};

export default useLockMechanism;
