'use client';

import { createContext, useContext, useState } from 'react';
import { invoke, Channel } from '@tauri-apps/api/core';
import { parseStructure, IStructure } from './structure';

export enum ConnectionState {
    Connected = "Connected",
    Reconnecting = "Reconnecting",
    Disconnected = "Disconnected"
}

interface MqttMessage {
    topic: string,
    payload: Uint8Array 
}

class Attribute {
    
}

export interface PlatformContextType {
    connectionState: ConnectionState;
    structure: IStructure | undefined;
    attributes: Record<string, Attribute>;
    connect: (address: string, port: number) => void;
    disconnect: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
    const [structure, setStructure] = useState<IStructure | undefined>(undefined);

    let firstAttempt: boolean = false;

    const connect = async (address: string, port: number) => {

        if (connectionState !== ConnectionState.Disconnected) {
            console.error(`Already connected or attempting reconnection. Disconnect first`);
            return ;
        }

        const onConnectionState = new Channel<ConnectionState>();
        firstAttempt = true;
        
        const waitForConnection = new Promise<ConnectionState>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Connection timed out"));
            }, 3000);

            onConnectionState.onmessage = async (message) => {
                switch (message) {
                    case ConnectionState.Connected:
                        clearTimeout(timeout);
                        try {
                            setStructure(await parseStructure());
                            setConnectionState(ConnectionState.Connected);
                            resolve(ConnectionState.Connected);
                        } catch (e) {
                            console.error(`Could not get structure: ${e}`)
                        }
                        break;
                    case ConnectionState.Reconnecting:
                        setStructure(undefined);
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

        try {
            await waitForConnection;
        } catch (e) {
            console.error({e});
            disconnect();
            return ;
        }
    }

    const disconnect = () => {
        invoke('disconnect_from_platform');
        setStructure(undefined);
        setConnectionState(ConnectionState.Disconnected);
    }

    return (
        <PlatformContext.Provider value={{ connectionState, structure, connect, disconnect }}>
            {children}
        </PlatformContext.Provider>
    );
};

export const usePlatform = () => {
    const context = useContext(PlatformContext);

    if (!context) {
        throw new Error('usePlatform must be used inside a PlatformProvider');
    }
    return context;
};
