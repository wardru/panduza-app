import { invoke, Channel } from '@tauri-apps/api/core';
import { IAttribute } from './structure';

export enum AttributeType {
    String = 'string',
    Enum = 'enum',
    Bool = 'boolean',
    Si = 'si',
    Number = 'number',
    Json = 'json',
    MemoryCommand = 'memory_command',
}

export enum AttributeMode {
    RO = 'RO',
    RW = 'RW',
    WO = 'WO',
}

export abstract class Attribute {
    readonly name: string;
    readonly path: string;
    readonly topic: string;
    readonly cmd_topic: string;
    readonly type: string;
    readonly parentClasses: string[];
    readonly classPath: string;
    readonly parentDriver: string;
    readonly mode: string;
    readonly info?: string;
    readonly settings?: unknown;

    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        this.name = name;
        this.topic = ['pza', parentDriver, ...parentClasses, name, 'att'].join('/');
        this.cmd_topic = ['pza', parentDriver, ...parentClasses, name, 'cmd'].join('/');
        this.path = [parentDriver, ...parentClasses, name].join('/');
        this.parentClasses = parentClasses;
        this.classPath = parentClasses.join('/');
        this.parentDriver = parentDriver;
        this.type = cfg.type;
        this.mode = cfg.mode;
        this.info = cfg.info;
        this.settings = cfg.settings;
    }
}

export class AttributeString extends Attribute {
    private _value = '';
    private onAttributeMessage: Channel<Uint8Array>;
    private listeners: Array<() => void> = []; // Listeners to notify on change

    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);
        this.onAttributeMessage = new Channel<Uint8Array>();

        invoke('register_attribute', {
            attributeTopic: this.topic,
            onAttributeMessage: this.onAttributeMessage,
        });

        this.onAttributeMessage.onmessage = (message) => {
            const decoder = new TextDecoder('utf-8');
            const str = decoder.decode(new Uint8Array(message));
            this._value = str.slice(1, -1);
            this.notifyListeners();
        };
    }

    get value(): string {
        return this._value;
    }

    publish(val: string) {
        const bytes = new TextEncoder().encode('"' + val + '"');
        invoke('publish', { commandTopic: this.cmd_topic, value: bytes });
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
    }

    unsubscribe(listener: () => void) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }
}

export interface SiSettings {
    min: number;
    max: number;
    decimals: number;
    unit: string;
}

export class AttributeSi extends Attribute {
    private _value = 0;
    private onAttributeMessage: Channel<Uint8Array>;
    private listeners: Array<() => void> = []; // Listeners to notify on change

    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);

        if (!cfg.settings) {
            throw new Error("Attribute SI doesn't have settings!");
        }

        this.onAttributeMessage = new Channel<Uint8Array>();

        invoke('register_attribute', {
            attributeTopic: this.topic,
            onAttributeMessage: this.onAttributeMessage,
        });

        this.onAttributeMessage.onmessage = (message) => {
            this._value = Number(String.fromCharCode(...message));
            this.notifyListeners();
        };
    }

    publish(val: number) {
        const bytes = new TextEncoder().encode(val.toString());
        invoke('publish', { commandTopic: this.cmd_topic, value: bytes });
    }

    get value(): number {
        return this._value;
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
    }

    unsubscribe(listener: () => void) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }
}

export class AttributeBool extends Attribute {
    _value = false;
    onAttributeMessage: Channel<Uint8Array>;
    listeners: Array<() => void> = []; // Listeners to notify on change

    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);
        this.onAttributeMessage = new Channel<Uint8Array>();

        invoke('register_attribute', {
            attributeTopic: this.topic,
            onAttributeMessage: this.onAttributeMessage,
        });

        this.onAttributeMessage.onmessage = (message) => {
            const str = String.fromCharCode(...message);
            this._value = str === 'false' ? false : true;
            this.notifyListeners();
        };
    }

    publish(val: boolean) {
        const bytes = new TextEncoder().encode(val === false ? 'false' : 'true');
        invoke('publish', { commandTopic: this.cmd_topic, value: bytes });
    }

    get value(): boolean {
        return this._value;
    }

    toggleValue() {
        this.publish(!this._value);
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
    }

    unsubscribe(listener: () => void) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }
}

export interface EnumSettings {
    choices: string[];
}

export class AttributeEnum extends Attribute {
    private _value = '';
    private _props: EnumSettings = {
        choices: [],
    };
    private onAttributeMessage: Channel<Uint8Array>;
    private listeners: Array<() => void> = []; // Listeners to notify on change

    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);

        if (!cfg.settings) {
            throw new Error("Attribute Enum doesn't have settings!");
        }

        this._props.choices = cfg.settings.choices;

        this.onAttributeMessage = new Channel<Uint8Array>();

        invoke('register_attribute', {
            attributeTopic: this.topic,
            onAttributeMessage: this.onAttributeMessage,
        });

        this.onAttributeMessage.onmessage = (message) => {
            this._value = String.fromCharCode(...message).slice(1, -1);
            this.notifyListeners();
        };
    }

    publish(val: string) {
        const bytes = new TextEncoder().encode('"' + val + '"');
        invoke('publish', { commandTopic: this.cmd_topic, value: bytes });
    }

    get value(): string {
        return this._value;
    }

    get choices(): string[] {
        return this._props.choices;
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
    }

    unsubscribe(listener: () => void) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }
}

export class AttributeNumber extends Attribute {
    _value = 0;
    onAttributeMessage: Channel<Uint8Array>;
    listeners: Array<() => void> = []; // Listeners to notify on change

    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);
        this.onAttributeMessage = new Channel<Uint8Array>();

        invoke('register_attribute', {
            attributeTopic: this.topic,
            onAttributeMessage: this.onAttributeMessage,
        });

        this.onAttributeMessage.onmessage = (message) => {
            this._value = Number(String.fromCharCode(...message));
            this.notifyListeners();
        };
    }

    publish(val: number) {
        const bytes = new TextEncoder().encode(val.toString());
        invoke('publish', { commandTopic: this.cmd_topic, value: bytes });
    }

    get value(): number {
        return this._value;
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
    }

    unsubscribe(listener: () => void) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }
}
export class AttributeJson extends Attribute {}
export class AttributeMemoryCommand extends Attribute {}
