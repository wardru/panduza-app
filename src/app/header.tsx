'use client';

import Image from 'next/image';
import PanduzaLogo from "../images/logo/logo_circle_black_blue_256.png";
import {useState, useEffect, useContext} from 'react';
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
        <div className="flex-shrink-0 ml-2 mr-5" > {/* Ensures the logo doesn’t shrink */}
            <Image
                src={PanduzaLogo}
                width={27}
                height={27}
                alt="logo"
            />
        </div>
    );
}

const Header: React.FC = () => {
    const { connectionState, connect, disconnect } = usePlatform();
    const [address, setAddress] = useState(defaultAddress);
    const [portAsString, setPortAsString] = useState(defaultPort.toString());

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
                let port: number = Number(portAsString);
                if (isNaN(port) || port < 0 || port > 65535) {
                    console.error(`Port ${port} is invalid! Must be a number between 0 and 65535`);
                }
                else {
                    await connect(address, port);
                }
                break;
        }
    }

    return (
        <div className="bg-header sticky top-0 flex py-1"> {/* Adjusted padding for more height */}
            <Logo/>
            <div className="text-gray-400 flex flex-shrink-0 flex-grow space-x-2 items-center">
                {(connectionState == ConnectionState.Reconnecting) ?
                    <p>Reconnecting...</p> : null
                }
                <button className="text-primary hover:bg-slate-500 px-4 rounded-lg"
                    onClick={onButtonAction}>
                    {getButtonContent()}
                </button>
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                 {(connectionState === ConnectionState.Disconnected) ? (
                    <div className="pl-3 text-black space-x-2">
                        <input
                            placeholder={defaultAddress}
                            onChange={(e) => {setAddress(e.currentTarget.value === "" ? defaultAddress : e.currentTarget.value)}}
                        />
                        <input
                            placeholder={defaultPort.toString()}
                            onChange={(e) => {setPortAsString(e.currentTarget.value === "" ? defaultPort.toString() : e.currentTarget.value)}}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default Header;
