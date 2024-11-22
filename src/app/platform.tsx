'use client';

import { createContext, useContext, useState } from 'react';
import { invoke, Channel } from '@tauri-apps/api/core';
import { register_platform_driver } from './driver';

export enum ConnectionState {
    Connected = "Connected",
    Reconnecting = "Reconnecting",
    Disconnected = "Disconnected"
}



export interface PlatformContextType {
    connectionState: ConnectionState;
    connect: (address: string, port: number) => void;
    disconnect: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
    let firstAttempt: boolean = false;
    
    const connect = async (address: string, port: number) => {

        if (connectionState !== ConnectionState.Disconnected) {
            console.error(`Already connected or attempting reconnection. Disconnect first`);
            return ;
        }

        const onConnectionState = new Channel<ConnectionState>();
        firstAttempt = true;
        
        const waitForConnection = new Promise<ConnectionState>((resolve, reject) => {
            onConnectionState.onmessage = (message) => {
                console.log(`wtfff ${message}`);
                switch (message) {
                    case ConnectionState.Connected:
                        setConnectionState(ConnectionState.Connected);
                        register_platform_driver();
                        resolve(ConnectionState.Connected);
                        break;
                    case ConnectionState.Reconnecting:
                        if (firstAttempt == true) {
                            disconnect();
                            reject("Could not connect");
                        }
                        else {
                            setConnectionState(ConnectionState.Reconnecting);
                        }
                        break;
                }
                firstAttempt = false;
            }
        });
   
        try {
            await invoke('connect_to_platform', { address: address, port: port, onConnectionState})
        } catch(e) {
            console.error(`Error. Couldn't connect: ${e}`);
            return ;    
        };

        const timeout = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error("Connection timed out"));
            }, 3000); // Timeout after 5 seconds
        });

        try {
            await Promise.race([waitForConnection, timeout]);
        } catch (e) {
            console.error({e});
            disconnect();
            return ;
        }
    }

    const disconnect = () => {
        invoke('disconnect_from_platform');
        setConnectionState(ConnectionState.Disconnected);
    }

    return (
        <PlatformContext.Provider value={{ connectionState, connect, disconnect }}>
            {children}
        </PlatformContext.Provider>
    );
};

export const useClient = () => {
    const context = useContext(PlatformContext);

    if (!context) {
        throw new Error('useClient must be used inside a PlatformProvider');
    }
    return context;
};
