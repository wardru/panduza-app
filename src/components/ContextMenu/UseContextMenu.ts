import { ContextMenuImperativeApi, ContextMenuData } from './ContextMenu';
import { useRef } from 'react';

export const useContextMenu = () => {
    const contextMenu = useRef<ContextMenuImperativeApi>(null);

    const handleMouseMove = (event: MouseEvent) => {
        if (contextMenu.current?.isOutsideWithMargins(event.clientX, event.clientY)) {
            close();
        }
    };

    const handleMouseClick = (event: MouseEvent) => {
        event?.preventDefault();
        close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            close();
        }
    };

    const show = (event: React.MouseEvent, model: ContextMenuData[]) => {
        event.preventDefault();

        if (!contextMenu.current) return;

        contextMenu.current?.open(event.clientX, event.clientY, model);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleMouseClick);
        document.addEventListener('contextmenu', handleMouseClick);
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.pointerEvents = 'none';
    };

    const close = () => {
        contextMenu.current?.close();

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleMouseClick);
        document.removeEventListener('contextmenu', handleMouseClick);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.pointerEvents = 'auto';
    };

    const setContextMenuRef = (newRef: ContextMenuImperativeApi | null) => {
        contextMenu.current = newRef;
    };

    return { show, setContextMenuRef };
};
