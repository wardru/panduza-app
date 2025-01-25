'use client';

import Image from 'next/image';
import PanduzaLogo from '../images/logo/logo_circle_black_blue_256.png';
import { useState } from 'react';
import { usePlatform, ConnectionState } from './platform';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useShallow } from 'zustand/shallow';
import { useHeaderStore } from './HeaderStore';

const statusColorMap: Record<ConnectionState, string> = {
    [ConnectionState.Connected]: 'bg-green-500',
    [ConnectionState.Disconnected]: 'bg-red-500',
    [ConnectionState.Reconnecting]: 'bg-orange-500',
};

const buttonContentMap: Record<ConnectionState, string> = {
    [ConnectionState.Connected]: 'disconnect',
    [ConnectionState.Disconnected]: 'connect',
    [ConnectionState.Reconnecting]: 'cancel',
};

const Logo = () => {
    return (
        <div className='flex-shrink-0 ml-2 mr-5'>
            <Image
                src={PanduzaLogo}
                width={27}
                height={27}
                alt='logo'
            />
        </div>
    );
};

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const languageMap: Record<string, string> = {
        ['en']: 'English',
        ['fr']: 'Français',
    };

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(event.currentTarget.value);
    };

    return (
        <div className='flex space-x-2 items-center'>
            <LanguageIcon className='text-white size-4' />
            <select
                className='bg-transparent text-white border border-white rounded-md px-2 appearance-none'
                onChange={handleChange}
            >
                {Object.entries(languageMap).map(([key, value]) => (
                    <option
                        key={key}
                        value={key}
                    >
                        {value}
                    </option>
                ))}
            </select>
        </div>
    );
};

const Scanner = () => {
    const { t } = useTranslation('header');

    const handleScanner = () => {
        const scannerWebview = new WebviewWindow('scannerWebview', {
            url: '/scanner',
        });

        scannerWebview.once('tauri://created', () => {
            scannerWebview.setTitle(t('scanner')).catch(console.error);
        });
    };

    return (
        <button
            className='hover:bg-slate-600 px-4 rounded-lg text-primary mr-5'
            onClick={handleScanner}
        >
            {t('scanner')}
        </button>
    );
};

interface HeaderProps {
    onAboutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAboutClick }) => {
    const { connectionState, connect, disconnect } = usePlatform();
    const { address, setAddress, port, setPort } = useHeaderStore(
        useShallow((state) => ({
            address: state.address,
            port: state.port,
            setAddress: state.setAddress,
            setPort: state.setPort,
        }))
    );

    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation('header');

    const getStatusColor = () => {
        const color = statusColorMap[connectionState];

        if (!color) {
            throw new Error(`Unknown state: ${connectionState}`);
        }
        return color;
    };

    const getButtonContent = () => {
        const buttonContent = buttonContentMap[connectionState];

        if (!buttonContent) {
            throw new Error(`Unknown state: ${connectionState}`);
        }
        return buttonContent;
    };

    const onButtonAction = async () => {
        switch (connectionState) {
            case ConnectionState.Connected:
            case ConnectionState.Reconnecting:
                disconnect();
                break;
            case ConnectionState.Disconnected:
                try {
                    if (address && port) {
                        connect(address, port);
                        setError(null);
                    }
                } catch (e) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    setError(errorMessage);
                }
                break;
        }
    };

    const handlePortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const str = event.currentTarget.value;
        const port = Number(str);

        if (isNaN(port) || str === '') {
            setPort(null);
            return;
        }
        if (port >= 0 && port <= 65535) {
            setPort(port);
        }
    };

    return (
        <div className='bg-header sticky top-0 flex py-1 items-center'>
            <Logo />
            <div className='text-primary flex space-x-2 items-center flex-1'>
                {connectionState == ConnectionState.Reconnecting ? <p>{t('reconnecting')}...</p> : null}
                <button
                    className='hover:bg-slate-600 px-4 rounded-lg'
                    onClick={onButtonAction}
                >
                    {t(getButtonContent())}
                </button>
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                {connectionState === ConnectionState.Disconnected ? (
                    <div className='pl-3 text-black space-x-2 flex'>
                        <input
                            value={address || ''}
                            placeholder='Enter an address'
                            onChange={(e) =>
                                e.currentTarget.value === '' ? setAddress(null) : setAddress(e.currentTarget.value)
                            }
                        />
                        <input
                            type='text'
                            pattern='[0-9]*'
                            value={port || ''}
                            placeholder='Enter a port'
                            onChange={handlePortChange}
                        />
                        {error && <p className='text-red-500 mt-2'>{t(error)}</p>}
                    </div>
                ) : null}
            </div>
            {connectionState == ConnectionState.Connected ? <Scanner /> : null}
            <LanguageSelector />
            <button
                className='hover:bg-slate-600 px-4 rounded-lg text-primary mr-5'
                onClick={() => {
                    onAboutClick();
                }}
            >
                {t('about')}
            </button>
        </div>
    );
};

export default Header;
