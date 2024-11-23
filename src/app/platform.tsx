'use client';

import { createContext, useContext, useState } from 'react';
import { invoke, Channel } from '@tauri-apps/api/core';
import { Driver } from './driver';

export enum ConnectionState {
    Connected = "Connected",
    Reconnecting = "Reconnecting",
    Disconnected = "Disconnected"
}

interface MqttMessage {
    topic: string,
    payload: Uint8Array 
}

export async function register_platform_driver() {
    const onDriverMessage = new Channel<MqttMessage>;

    const waitForStructure = async () => {
        return new Promise<Uint8Array>((resolve, reject) => {

            const timeout = setTimeout(() => {
                reject("timed out");
            }, 1000);

            onDriverMessage.onmessage = (message) => {
                // we got a structure, we clear the timeout and resolve the promise with the raw payload.
                clearTimeout(timeout);
                resolve(message.payload);
            }
        });
    }

    await invoke('register_driver', { driverName: "_", attributeList: ["structure"], onDriverMessage });

    try {
        const payload = await waitForStructure();
        const structure_json = JSON.parse(String.fromCharCode(...payload));

        // register drivers
        
        for (let driver in structure_json.driver_instances) {
            console.log(driver);
        }

    } catch(e) {
        console.error(e);
    }
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
    let driverMap = new Map<string, Driver>;
    
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

            onConnectionState.onmessage = (message) => {
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
