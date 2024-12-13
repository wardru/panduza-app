'use client';

import { createContext, useContext, useState, useEffect} from 'react';
import { invoke, Channel } from '@tauri-apps/api/core';
import { parseStructure, IStructure, IAttribute, IClass } from './structure';
import { Attribute, AttributeString, AttributeEnum, AttributeBool, AttributeSi, AttributeType} from './attribute';

export enum ConnectionState {
    Connected = "Connected",
    Reconnecting = "Reconnecting",
    Disconnected = "Disconnected"
}

export interface PlatformContextType {
    connectionState: ConnectionState;
    structure: IStructure | undefined;
    attributes: AttributeMap | undefined;
    connect: (address: string, port: number) => void;
    disconnect: () => void;
}

const factoryMap: Record<string, (name: string, driver: string, classes: string[], cfg: IAttribute) => Attribute> = {
    [AttributeType.String]: (name, driver, classes, cfg) => new AttributeString(name, driver, classes, cfg),
    [AttributeType.Bool]: (name, driver, classes, cfg) => new AttributeBool(name, driver, classes, cfg),
    [AttributeType.Enum]: (name, driver, classes, cfg) => new AttributeEnum(name, driver, classes, cfg),
    [AttributeType.Si]: (name, driver, classes, cfg) => new AttributeSi(name, driver, classes, cfg),
}

type AttributeMap = Record<string, Attribute>;

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
    const [structure, setStructure] = useState<IStructure | undefined>(undefined);
    const [attributes, setAttributes] = useState<AttributeMap | undefined>(undefined);

    const createNewAttribute = (name: string, driver: string, classes: string[], cfg: IAttribute): Attribute => {
        const factory = factoryMap[cfg.type];
        if (!factory) {
            throw new Error(`Unsupported attribute type: ${cfg.type}`);
        }
        return factory(name, driver, classes, cfg);
    };

    const createAttributesInClass = (map: AttributeMap, driver: string, parentClasses: string[], self: IClass) => {
        for (const attribute in self.attributes) {
            const path = [driver, ...parentClasses, attribute].join('/');
            map[path] = createNewAttribute(attribute, driver, parentClasses, self.attributes[attribute]);
        }
        for (const iclass in self.classes) {
            createAttributesInClass(map, driver, [...parentClasses, iclass] , self.classes[iclass]);
        }
    };

    const createAttributeMap = (structure: IStructure) : AttributeMap => {
        const newMap: AttributeMap = {};

        for (const driver in structure.drivers) {
            const attributes = structure.drivers[driver].attributes;
            const classes = structure.drivers[driver].classes;

            for (const attribute in attributes) {
                newMap[`${driver}/${attribute}`] = createNewAttribute(attribute, driver, [], attributes[attribute]);
            }

            for (const iclass in classes) {
                createAttributesInClass(newMap, driver, [iclass], classes[iclass]);
            }
        }
        return newMap;
    };

    useEffect(() => {

        // ONLY FOR HOT RELOAD DEBUG PURPOSE
        // causes a warning: IPC custom protocol failed, Tauri will now use the postMessage interface instead
        // ultimately we should kill the reload function at some point

        window.onbeforeunload = function() {
            disconnect();
        };

        return () => {
            window.onbeforeunload = null;
        };
    });

    const connectToPlatform = async () => {
        const structure = await parseStructure();
        setStructure(structure);
        setAttributes(createAttributeMap(structure));
    }

    const disconnectFromPlatform = async () => {
        setStructure(undefined);
        setAttributes(undefined);
    }

    const connect = async (address: string, port: number) => {

        if (connectionState !== ConnectionState.Disconnected) {
            console.error(`Already connected or attempting reconnection. Disconnect first`);
            return ;
        }

        const onConnectionState = new Channel<ConnectionState>();
        
        onConnectionState.onmessage = async (message) => {
            switch (message) {
                case ConnectionState.Connected:
                    await connectToPlatform();
                    setConnectionState(ConnectionState.Connected);
                    break;
                case ConnectionState.Reconnecting:
                    await disconnectFromPlatform();
                    setConnectionState(ConnectionState.Reconnecting);
                    break;
            }
        }
   
        try {
            await invoke('connect_to_platform', { address: address, port: port, onConnectionState})
            await connectToPlatform();
            setConnectionState(ConnectionState.Connected);
        } catch(e) {
            throw new Error(`Error. ${e}`);
        };
    }

    const disconnect = async () => {
        invoke('disconnect_from_platform');
        await disconnectFromPlatform();
        setConnectionState(ConnectionState.Disconnected);
    }

    return (
        <PlatformContext.Provider value={{ connectionState, attributes, structure, connect, disconnect }}>
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
