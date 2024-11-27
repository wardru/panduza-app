import { invoke, Channel } from '@tauri-apps/api/core';
import { IAttribute } from './structure';

export enum AttributeType {
    String = "string",
    Enum = "enum",
    Bool = "boolean",
    Si = "si"
}

export enum AttributeMode {
    RO = "RO",
    RW = "RW",
    WO = "WO"
}

export abstract class Attribute {
    readonly name: string;
    readonly topic: string;
    readonly type: string;
    readonly parentClasses: string[];
    readonly parentDriver: string;
    readonly mode: string;
   
    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        this.name = name;
        this.topic = ["pza", parentDriver, ...parentClasses, name, "att"].join('/');
        this.parentClasses = parentClasses;
        this.parentDriver = parentDriver;
        this.type = cfg.type;
        this.mode = cfg.mode;
    }
}

export class AttributeString extends Attribute {
    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);
    }
}

export class AttributeBool extends Attribute {
    _value: boolean = false;
    onAttributeMessage: Channel<Uint8Array>;
    listeners: Array<() => void> = []; // Listeners to notify on change

    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);
        this.onAttributeMessage = new Channel<Uint8Array>();

        invoke('register_attribute', { attributeTopic: this.topic, onAttributeMessage: this.onAttributeMessage });
    
        this.onAttributeMessage.onmessage = (message) => {
            const str = String.fromCharCode(...message);
            this._value = (str === "false") ? false : true;
            this.notifyListeners();
        }
    }

    setValue(val: boolean) {
        let bytes = new TextEncoder().encode((val === false) ? "false" : "true");
        console.log(`lol: ${val} ${bytes}`);
        invoke('publish', { attributeTopic: this.topic, value: bytes});
    }

    get value() : boolean {
        return this._value;
    }

    toggleValue() {
        this.setValue(!this._value);
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

export class AttributeEnum extends Attribute {
    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);
    }
}

export class AttributeSI extends Attribute {
    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);
    }
}
