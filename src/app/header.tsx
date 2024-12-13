'use client';

import Image from 'next/image';
import PanduzaLogo from "../images/logo/logo_circle_black_blue_256.png";
import {useState} from 'react';
import { usePlatform, ConnectionState } from './platform';

const statusColorMap: Record<ConnectionState, string> = {
    [ConnectionState.Connected]: 'bg-green-500',
    [ConnectionState.Disconnected]: 'bg-red-500',
    [ConnectionState.Reconnecting]: 'bg-orange-500',
};

const buttonContentMap: Record<ConnectionState, string> = {
    [ConnectionState.Connected]: 'Disconnect',
    [ConnectionState.Disconnected]: 'Connect',
    [ConnectionState.Reconnecting]: 'Cancel'
}

const defaultAddress: string = "localhost";
const defaultPort: number = 1883;

const Logo = () => {
    return (
        <div className="flex-shrink-0 ml-2 mr-5" >
            <Image
                src={PanduzaLogo}
                width={27}
                height={27}
                alt="logo"
            />
        </div>
    );
}

interface HeaderProps {
    onAboutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({onAboutClick}) => {
    const { connectionState, connect, disconnect } = usePlatform();
    const [address, setAddress] = useState(defaultAddress);
    const [portAsString, setPortAsString] = useState(defaultPort.toString());
    const [error, setError] = useState<string | null>(null);

    const getStatusColor = () => {
        const color = statusColorMap[connectionState];
    
        if (!color) {
            throw new Error(`Unknown state: ${connectionState}`);
        }
        return color;
    }

    const getButtonContent = () => {

        const buttonContent = buttonContentMap[connectionState];

        if (!buttonContent) {
            throw new Error(`Unknown state: ${connectionState}`);
        }
        return buttonContent;
    }

    const onButtonAction = async () => {
        switch (connectionState) {
            case ConnectionState.Connected:
            case ConnectionState.Reconnecting:
                disconnect();
                break;
            case ConnectionState.Disconnected:
                const port: number = Number(portAsString);
                if (isNaN(port) || port < 0 || port > 65535) {
                    setError(`Port ${port} is invalid! Must be a number between 0 and 65535`);
                }
                else {
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
    }

    return (
       <div className="bg-header sticky top-0 flex py-1 items-center">
           <Logo />
           <div className="text-primary flex space-x-2 items-center flex-1">
               {(connectionState == ConnectionState.Reconnecting) ? (
                   <p>Reconnecting...</p>
               ) : null}
               <button
                   className="hover:bg-slate-600 px-4 rounded-lg"
                   onClick={onButtonAction}>
                   {getButtonContent()}
               </button>
               <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
               {(connectionState === ConnectionState.Disconnected) ? (
                   <div className="pl-3 text-black space-x-2 flex">
                       <input
                           placeholder={defaultAddress}
                           onChange={(e) =>
                               setAddress(e.currentTarget.value === "" ? defaultAddress : e.currentTarget.value)
                           }
                       />
                       <input
                           placeholder={defaultPort.toString()}
                           onChange={(e) =>
                               setPortAsString(e.currentTarget.value === "" ? defaultPort.toString() : e.currentTarget.value)
                           }
                       />
                       {error && <p className="text-red-500 mt-2">{error}</p>}
                   </div>
               ) : null}
           </div>
           <button className="hover:bg-slate-600 px-4 rounded-lg text-primary mr-5" onClick={() => {onAboutClick()}}>
               About
           </button>
       </div>
    );
}

export default Header;
