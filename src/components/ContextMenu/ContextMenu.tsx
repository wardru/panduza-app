import { forwardRef } from 'react';
import ReactDOM from 'react-dom';
import { useState, useRef, useImperativeHandle } from 'react';

export interface ContextMenuData {
    label: string;
    action: () => void;
    //TODO: submenus are not supported for now
    submenus?: ContextMenuData[];
}

export interface ContextMenuImperativeApi {
    open: (x: number, y: number, model: ContextMenuData[]) => void;
    close: () => void;
    isOutsideWithMargins: (x: number, y: number) => boolean;
}

export const ContextMenu = forwardRef((_, ref) => {
    const MARGIN = 30;
    const localRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<ContextMenuData[] | null>(null);

    useImperativeHandle(ref, () => {
        return {
            open: (x: number, y: number, items: ContextMenuData[]) => {
                setPosition({ x, y });
                setIsOpen(true);
                setItems(items);
            },

            close: () => setIsOpen(false),

            isOutsideWithMargins: (x: number, y: number): boolean => {
                const box = localRef.current?.getBoundingClientRect();
                if (!box) {
                    return false;
                }

                return (
                    x < box.left - MARGIN || x > box.right + MARGIN || y < box.top - MARGIN || y > box.bottom + MARGIN
                );
            },
        };
    }, []);

    return ReactDOM.createPortal(
        <div
            ref={localRef}
            className={`fixed bg-white`}
            style={{
                top: position.y,
                left: position.x,
                zIndex: 9999, // the portal is great to push it out of the parent, but we still need to elevate because of allotment
                //TODO: probably this would fix the about message being behind the allotment splitters
                pointerEvents: 'auto',
                display: `${isOpen ? 'inline' : 'none'}`,
            }}
        >
            <ul className='text-sm'>
                {items?.map((item, index) => (
                    <li
                        key={index}
                        className='px-4 py-2 hover:bg-gray-200 cursor-pointer'
                        onClick={item.action}
                    >
                        {item.label}
                    </li>
                ))}
            </ul>
        </div>,
        document.body
    );
});

ContextMenu.displayName = 'ContextMenu';
