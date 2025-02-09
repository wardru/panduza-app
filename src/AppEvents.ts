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
        //disable default window behaviors on some events to avoid alert sounds
        const events = ['cut', 'copy', 'paste'];

        const preventDefaultWindowEvents = (event: Event) => {
            const composedPath = event.composedPath()[0];

            if (
                !(
                    composedPath instanceof HTMLInputElement ||
                    composedPath instanceof HTMLAreaElement ||
                    composedPath instanceof HTMLTextAreaElement
                )
            ) {
                event.preventDefault();
                // preventDefault() if it is not an input item
            }
        };

        for (const event of events) {
            document.addEventListener(event, preventDefaultWindowEvents);
        }

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

            for (const event of events) {
                document.removeEventListener(event, preventDefaultWindowEvents);
            }

            if (unlisten) unlisten();
        };
    }, [onSaveKey, onAppClose]);
};
