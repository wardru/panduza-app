import { invoke, Channel } from '@tauri-apps/api/core';
import { IAttribute } from './structure';

export enum AttributeType {
    String = "string",
    Enum = "enum",
    Boolean = "boolean",
    SI = "si"
}

export enum AttributeMode {
    RO = "RO",
    RW = "RW",
    WO = "WO"
}

export abstract class Attribute {
    readonly name: string;
    readonly topic: string;
    readonly cmd_topic: string;
    readonly type: string;
    readonly parentClasses: string[];
    readonly parentDriver: string;
    readonly mode: string;
   
    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        this.name = name;
        this.topic = "";
        this.parentClasses = parentClasses;
        this.parentDriver = parentDriver;
        this.cmd_topic = "";
        this.type = cfg.type;
        this.mode = cfg.mode;
    }
}

export class AttributeString extends Attribute {
    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);
    }
}

export class AttributeBoolean extends Attribute {
    constructor(name: string, parentDriver: string, parentClasses: string[], cfg: IAttribute) {
        super(name, parentDriver, parentClasses, cfg);
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
