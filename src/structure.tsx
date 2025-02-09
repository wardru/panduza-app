/* eslint-disable @typescript-eslint/no-explicit-any */

import { Channel, invoke } from '@tauri-apps/api/core';

export interface IAttribute {
    mode: string;
    type: string;
    settings?: any;
    info?: string;
}

export interface IClass {
    attributes: Record<string, IAttribute>;
    classes: Record<string, IClass>;
    info?: string;
    tags: string[];
}

export interface IDriver {
    attributes: Record<string, IAttribute>;
    classes: Record<string, IClass>;
    info?: string;
}

export interface IStructure {
    drivers: Record<string, IDriver>;
    info?: string;
}

function validateKey(key: string, obj: any) {
    if (key in obj === false) {
        throw new Error(`Could not find key ${key} in obj ${JSON.stringify(obj)}`);
    }
}

function validateKeys(itf: any, obj: any) {
    for (const key in itf) {
        validateKey(key, obj);
    }
}

function parseTags(obj: any) {
    if (Array.isArray(obj.tags)) {
        const allStrings = obj.tags.every((tag: any) => typeof tag === 'string');

        if (allStrings) {
            return obj.tags;
        }
    }
    throw new Error(`Tags field is not an array of strings: ${JSON.stringify(obj)}`);
}

function parseInfo(obj: any) {
    if (typeof obj.info === 'string' || obj.info === null) {
        return obj.info;
    }
    throw new Error(`Info field has bad type in obj: ${JSON.stringify(obj)}`);
}

function parseMode(obj: any) {
    if (typeof obj.mode === 'string' && ['RO', 'RW', 'WO'].includes(obj.mode)) {
        return obj.mode;
    }
    throw new Error(`Mode field has bad type or is not a valid mode ${obj.mode}`);
}

function parseType(obj: any) {
    const typeList = ['string', 'boolean', 'si', 'enum', 'json', 'number', 'memory_command'];

    if (typeof obj.type === 'string' && typeList.includes(obj.type)) {
        return obj.type;
    }
    throw new Error(`Type ${obj.type} has bad type or is not a valid type`);
}

async function fetchStructure() {
    const onStructureMessage = new Channel<Uint8Array>();

    const waitForStructure = async () => {
        return new Promise<Uint8Array>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject('timed out');
            }, 1000);

            onStructureMessage.onmessage = (message) => {
                // we got a structure, we clear the timeout and resolve the promise with the raw payload.
                clearTimeout(timeout);
                resolve(message);
            };
        });
    };

    await invoke('register_attribute', {
        attributeTopic: 'pza/_/structure/att',
        onAttributeMessage: onStructureMessage,
    });

    const payload = await waitForStructure();
    const decoder = new TextDecoder('utf-8');
    const jsonString = decoder.decode(new Uint8Array(payload));
    const structure_json = JSON.parse(jsonString);

    return structure_json;
}

function registerAttribute(obj: any) {
    const iattribute: IAttribute = {
        info: undefined,
        mode: '',
        type: '',
        settings: undefined,
    };

    validateKeys(iattribute, obj);

    iattribute.info = parseInfo(obj);
    iattribute.mode = parseMode(obj);
    iattribute.type = parseType(obj);

    if ('settings' in obj) {
        iattribute.settings = obj.settings;
    }

    return iattribute;
}

function registerClass(obj: any) {
    const iclass: IClass = {
        attributes: {},
        classes: {},
        info: undefined,
        tags: [],
    };

    validateKeys(iclass, obj);

    iclass.info = parseInfo(obj);
    iclass.tags = parseTags(obj);

    for (const attributeKey in obj.attributes) {
        iclass.attributes[attributeKey] = registerAttribute(obj.attributes[attributeKey]);
    }

    for (const classKey in obj.classes) {
        iclass.classes[classKey] = registerClass(obj.classes[classKey]);
    }

    return iclass;
}

function registerDriver(obj: any) {
    const idriver: IDriver = {
        attributes: {},
        classes: {},
        info: undefined,
    };

    validateKeys(idriver, obj);

    idriver.info = parseInfo(obj);

    for (const attributeKey in obj.attributes) {
        idriver.attributes[attributeKey] = registerAttribute(obj.attributes[attributeKey]);
    }

    for (const classKey in obj.classes) {
        idriver.classes[classKey] = registerClass(obj.classes[classKey]);
    }

    return idriver;
}

export async function parseStructure() {
    const jsonPayload = await fetchStructure();
    const istructure: IStructure = {
        drivers: {},
        info: undefined,
    };

    validateKey('driver_instances', jsonPayload);

    istructure.info = parseInfo(jsonPayload);

    for (const driverKey in jsonPayload.driver_instances) {
        try {
            istructure.drivers[driverKey] = registerDriver(jsonPayload.driver_instances[driverKey]);
        } catch (e) {
            console.error(`Error registering driver ${driverKey}: {}`, e);
        }
    }

    return istructure;
}
