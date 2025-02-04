import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

import { PlatformProvider } from './platform';
import Header from './header';
import Explorer from './explorer';
import ControlPanel from './ControlView/ControlView';

import { useState, useEffect } from 'react';

import { getName } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';

import './i18n';

import { useTranslation } from 'react-i18next';

import {
    DndContext,
    pointerWithin,
    useSensors,
    useSensor,
    MouseSensor,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

import { useGlobalStore } from './store';

import { useAppEvents } from './AppEvents';

interface appInfoProps {
    name: string;
    buildInfo: string;
}

const App = () => {
    const [showAbout, setShowAbout] = useState(false);
    const [appInfo, setAppInfo] = useState<appInfoProps>();
    const [draggedNode, setDraggedNode] = useState<{ id: string; label: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { t } = useTranslation('about');
    const save = useGlobalStore((state) => state.save);
    const load = useGlobalStore((state) => state.load);

    useAppEvents({
        onAppClose: async () => await save(),
        onSaveKey: () => save(),
    });

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    const sensors = useSensors(mouseSensor);

    useEffect(() => {
        const getAppInfo = async () => {
            const name = await getName();
            const buildInfo: string = await invoke('get_build_info');

            setAppInfo({ name, buildInfo });
        };

        getAppInfo().catch(console.error);

        load();
    }, [load]);

    const handleAboutClick = () => {
        setShowAbout(true);
    };

    const handleAboutClose = () => {
        setShowAbout(false);
    };

    const handleOverlayClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            handleAboutClose();
        }
    };

    return (
        <PlatformProvider>
            <div
                className='bg-background flex h-screen w-screen flex-col'
                onContextMenu={(event) => event.preventDefault()}
            >
                <Header onAboutClick={handleAboutClick} />

                <DndContext
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    collisionDetection={pointerWithin}
                    sensors={sensors}
                    autoScroll={false}
                >
                    <Allotment defaultSizes={[1, 3]}>
                        <Explorer />
                        <ControlPanel />
                    </Allotment>

                    <DragOverlay
                        modifiers={[snapCenterToCursor]}
                        dropAnimation={null}
                    >
                        {draggedNode ? (
                            <label
                                className={`bg-background border-active rounded-md border px-4 py-1.5 ${isDragging ? 'cursor-grabbing' : 'cursor-auto'}`}
                            >
                                {draggedNode.label}
                            </label>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {showAbout && (
                <div
                    className='bg-primary/30 fixed inset-0 flex items-center justify-center'
                    style={{ zIndex: 1000 }}
                    onClick={handleOverlayClick}
                >
                    <div className='bg-secondary min-w-96 rounded-lg p-6 text-center shadow-lg'>
                        <h2 className='mb-4 text-2xl font-bold'>{appInfo?.name}</h2>
                        <p className='mb-6'>
                            {' '}
                            {t('version')}: {appInfo?.buildInfo}
                        </p>
                    </div>
                </div>
            )}
        </PlatformProvider>
    );

    function handleDragStart(event: DragStartEvent) {
        setDraggedNode(event.active.data.current ? (event.active.data.current as { id: string; label: string }) : null);
        setIsDragging(true);
    }

    function handleDragEnd() {
        setDraggedNode(null);
        setIsDragging(false);
    }
};

export default App;
