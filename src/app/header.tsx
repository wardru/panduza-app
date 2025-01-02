'use client';

import Image from 'next/image';
import PanduzaLogo from '../images/logo/logo_circle_black_blue_256.png';
import { useState } from 'react';
import { usePlatform, ConnectionState } from './platform';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';

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

const defaultAddress = 'localhost';
const defaultPort = 1883;

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
        ['pt']: 'Português',
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

interface HeaderProps {
    onAboutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAboutClick }) => {
    const { connectionState, connect, disconnect } = usePlatform();
    const [address, setAddress] = useState(defaultAddress);
    const [portAsString, setPortAsString] = useState(defaultPort.toString());
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
                const port = Number(portAsString);
                if (isNaN(port) || port < 0 || port > 65535) {
                    setError('invalid-port');
                } else {
                    try {
                        await connect(address, port);
                        setError(null);
                    } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : String(e);
                        setError(errorMessage);
                    }
                }
                break;
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
                            placeholder={defaultAddress}
                            onChange={(e) =>
                                setAddress(e.currentTarget.value === '' ? defaultAddress : e.currentTarget.value)
                            }
                        />
                        <input
                            placeholder={defaultPort.toString()}
                            onChange={(e) =>
                                setPortAsString(
                                    e.currentTarget.value === '' ? defaultPort.toString() : e.currentTarget.value
                                )
                            }
                        />
                        {error && <p className='text-red-500 mt-2'>{t(error)}</p>}
                    </div>
                ) : null}
            </div>
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
