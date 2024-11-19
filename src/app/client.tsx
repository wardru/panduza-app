'use client';

import { createContext, useContext, useState, useRef, useEffect, PropsWithChildren } from 'react';
import { invoke, Channel } from '@tauri-apps/api/core';

export interface ClientContextType {
    connectionState: ConnectionState;
    connect: (address: string, port: number) => void;
    disconnect: () => void;

}

export enum ConnectionState {
    Connected = "Connected",
    Reconnecting = "Reconnecting",
    Disconnected = "Disconnected"
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);

    let firstAttempt: boolean = false;

    const createEventChannel = () => {
        const onConnectionState = new Channel<ConnectionState>();
        
        onConnectionState.onmessage = (message) => {
            switch (message) {
                case ConnectionState.Connected:
                    setConnectionState(ConnectionState.Connected);
                    break;
                case ConnectionState.Reconnecting:
                    if (firstAttempt == true) {
                        console.error("Could not connect");
                        disconnect();
                    }
                    else {
                        setConnectionState(ConnectionState.Reconnecting);
                    }
                    break;
            }
            firstAttempt = false;
        }

        return onConnectionState;
    }
    
    const connect = (address: string, port: number) => {
        if (connectionState !== ConnectionState.Disconnected) {
            console.error(`Already connected or attempting reconnection. Disconnect first`);
            return ;
        }

        const onConnectionState = createEventChannel();
        firstAttempt = true;
    
        invoke('connect_to_platform', { address: address, port: port, onConnectionState})
            .catch((e) => {
                console.error(`Error. Couldn't connect: ${e}`);
            })
    }

    const disconnect = () => {
        invoke('disconnect_from_platform');
        setConnectionState(ConnectionState.Disconnected);
    }

    return (
        <ClientContext.Provider value={{ connectionState, connect, disconnect }}>
            {children}
        </ClientContext.Provider>
    );
};

export const useClient = () => {
    const context = useContext(ClientContext);

    if (!context) {
        throw new Error('useClient must be used inside a ClientProvider');
    }
    return context;
};
