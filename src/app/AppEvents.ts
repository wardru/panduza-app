import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface useAppEventsProps {
    onAppClose: () => Promise<void>;
    onSaveKey: () => void;
}

export const useAppEvents = (props: useAppEventsProps) => {
    const { onSaveKey, onAppClose } = props;

    useEffect(() => {
        let unlisten: (() => void) | undefined;

        const handleKeyDown = async (event: KeyboardEvent) => {
            if (event.key == 's' && event.ctrlKey) {
                onSaveKey();
            }
        };

        const setupCloseListener = async () => {
            try {
                const window = getCurrentWindow();
                unlisten = await window.onCloseRequested(async () => {
                    await onAppClose();
                });
            } catch (error) {
                console.error('Failed to attach close listener:', error);
            }
        };

        setupCloseListener();

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (unlisten) unlisten();
        };
    }, [onSaveKey, onAppClose]);
};
