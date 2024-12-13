'use client';

import { Allotment } from 'allotment';
import "allotment/dist/style.css";

import { PlatformProvider } from './platform';
import Header from './header';
import TreePanel from './tree';
import ControlPanel from './control';

import { useState, useEffect} from 'react';

import { getVersion, getName } from '@tauri-apps/api/app';

interface appInfoProps {
    name: string,
    version: string
}

const Main = () => {
    const [showAbout, setShowAbout] = useState(false);
    const [appInfo, setAppInfo] = useState<appInfoProps>();

    useEffect(() => {
        const getAppInfo = async () => {
            const name = await getName();
            const version = await getVersion();

            setAppInfo({name, version})
        }

        getAppInfo().catch(console.error);
    }, []);

    
    const handleAboutClick = () => {
        setShowAbout(true);
    }

    const handleAboutClose = () => {
        setShowAbout(false);
    }

    const handleOverlayClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
          handleAboutClose();
        }
  };

    return (
        <PlatformProvider>
            <div className="bg-black h-screen w-screen flex flex-col overflow-hidden">
                <Header onAboutClick={handleAboutClick} />

                <Allotment defaultSizes={[1, 3]}>
                    <TreePanel />
                    <ControlPanel />
                </Allotment>
            </div>

            {showAbout && (
                <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50" onClick={handleOverlayClick}>
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center pointer-events-none ">
                        <h2 className="text-2xl font-bold mb-4">{appInfo?.name}</h2>
                        <p className="text-gray-700 mb-6">Version: {appInfo?.version}</p>
                    </div>
                </div>
            )}
        </PlatformProvider>
    );
};

export default Main;
