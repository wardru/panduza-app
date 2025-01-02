'use client';

import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

import { PlatformProvider } from './platform';
import Header from './header';
import Explorer from './explorer';
import ControlPanel from './control';

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

interface appInfoProps {
    name: string;
    buildInfo: string;
}

const Main = () => {
    const [showAbout, setShowAbout] = useState(false);
    const [appInfo, setAppInfo] = useState<appInfoProps>();
    const [draggedNode, setDraggedNode] = useState<{ id: string; label: string } | null>(null);
    const { t } = useTranslation('about');

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
    }, []);

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
            <div className='bg-black h-screen w-screen flex flex-col'>
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
                        {draggedNode ? <label className='text-white bg-red-700'>{draggedNode.label}</label> : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {showAbout && (
                <div
                    className='fixed inset-0 flex items-center justify-center bg-white bg-opacity-50'
                    onClick={handleOverlayClick}
                >
                    <div className='bg-white rounded-lg shadow-lg p-6 w-96 text-center '>
                        <h2 className='text-2xl font-bold mb-4'>{appInfo?.name}</h2>
                        <p className='text-gray-700 mb-6'>
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
    }

    function handleDragEnd() {
        setDraggedNode(null);
    }
};

export default Main;
