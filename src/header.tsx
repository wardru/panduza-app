import PanduzaLogo from './assets/images/logo/logo_circle_black_blue_256.png';
import { useState } from 'react';
import { usePlatform, ConnectionState } from './platform';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useShallow } from 'zustand/shallow';
import { useHeaderStore } from './HeaderStore';
import { useLanguageStore } from './LanguageStore';

const statusColorMap: Record<ConnectionState, string> = {
    [ConnectionState.Connected]: 'bg-dot-green',
    [ConnectionState.Disconnected]: 'bg-dot-red',
    [ConnectionState.Reconnecting]: 'bg-dot-orange',
};

const buttonContentMap: Record<ConnectionState, string> = {
    [ConnectionState.Connected]: 'disconnect',
    [ConnectionState.Disconnected]: 'connect',
    [ConnectionState.Reconnecting]: 'cancel',
};

interface LogoProps {
    className?: string;
    size: number;
}

const Logo: React.FC<LogoProps> = (props) => {
    return (
        <div className={props.className}>
            <img
                src={PanduzaLogo}
                width={props.size}
                height={props.size}
                alt='logo'
            />
        </div>
    );
};

const LanguageSelector = () => {
    const [language, setLanguage] = useLanguageStore(useShallow((state) => [state.language, state.setLanguage]));

    const languageMap: Record<string, string> = {
        ['en']: 'English',
        ['fr']: 'Français',
    };

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(event.currentTarget.value);
    };

    return (
        <div className='flex items-center space-x-2'>
            <LanguageIcon className='size-4' />
            <select
                onChange={handleChange}
                value={language}
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
            className='hover:bg-active-hover rounded-lg px-4'
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
        <div
            className='disable-select flex items-center space-x-4 py-1'
            onContextMenu={(event) => {
                //TODO: This is for debug purpose only. We allow the 'inspect element' and 'reload' on the header only.
                //At some point we should remove it once the app is more stable
                event.stopPropagation();
            }}
        >
            <Logo
                className='mr-6 ml-2 shrink-0'
                size={27}
            />
            <div className='flex flex-1 items-center space-x-4'>
                {connectionState == ConnectionState.Reconnecting ? <p>{t('reconnecting')}...</p> : null}
                <button
                    className='bg-active hover:bg-active-hover rounded-lg px-4'
                    onClick={onButtonAction}
                >
                    {t(getButtonContent())}
                </button>
                <div className={`size-2 rounded-full ${getStatusColor()}`} />
                {connectionState === ConnectionState.Disconnected ? (
                    <div className='flex space-x-2'>
                        <input
                            className='w-40'
                            value={address || ''}
                            placeholder='Enter an address'
                            onChange={(e) =>
                                e.currentTarget.value === '' ? setAddress(null) : setAddress(e.currentTarget.value)
                            }
                        />
                        <input
                            className='w-40'
                            type='text'
                            pattern='[0-9]*'
                            value={port || ''}
                            placeholder='Enter a port'
                            onChange={handlePortChange}
                        />
                        {error && <p className='mt-2 text-red-500'>{t(error)}</p>}
                    </div>
                ) : null}
            </div>
            {connectionState == ConnectionState.Connected ? <Scanner /> : null}
            <LanguageSelector />
            <button
                className='hover:bg-active-hover mr-5 rounded-lg px-4'
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
