import { ConnectionState, usePlatform } from '../platform';

import { useEffect, useState, useRef } from 'react';

import { AttributeBool, AttributeString, AttributeEnum, AttributeNumber, AttributeSi } from '@/app/attribute';

interface AttributeBoolListenerProps {
    path: string;
    mode: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

const useFreshValue = (duration = 1500) => {
    const timeoutId = useRef<number | null>(null);
    const [isFreshValue, setIsFreshValue] = useState(false);

    const triggerFresh = () => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }

        setIsFreshValue(true);

        timeoutId.current = window.setTimeout(() => {
            setIsFreshValue(false);
        }, duration);
    };

    return { triggerFresh, isFreshValue };
};

export const useAttributeBoolListener = (props: AttributeBoolListenerProps) => {
    const { path, mode, onConnect, onDisconnect } = props;
    const [attribute, setAttribute] = useState<AttributeBool | null>(null);
    const [connected, setConnected] = useState(false);
    const [value, setValue] = useState(false);
    const { triggerFresh, isFreshValue } = useFreshValue();
    const platform = usePlatform();

    const publish = (value: boolean) => {
        if (!attribute) return;

        if (attribute.mode === 'WO') {
            setValue(value);
        }
        attribute.publish(value);
    };

    useEffect(() => {
        if (platform.connectionState !== ConnectionState.Connected) {
            setAttribute(null);
        } else {
            const att = platform.attributes?.[path];

            if (!att || att.type !== 'boolean' || att.mode !== mode) {
                return;
            }

            const attBool = att as AttributeBool;

            setAttribute(attBool);
            setValue(attBool.value);
        }
    }, [platform.connectionState, platform.attributes, path, mode]);

    useEffect(() => {
        if (!attribute) {
            onDisconnect?.();
            setConnected(false);
        } else {
            onConnect?.();
            setConnected(true);
            if (attribute.mode !== 'WO') {
                const updateValue = () => {
                    setValue(attribute.value);
                    triggerFresh();
                };

                attribute.subscribe(updateValue);

                return () => {
                    attribute.unsubscribe(updateValue);
                };
            }
        }
    }, [attribute, triggerFresh, onConnect, onDisconnect]);

    return { value, publish, connected, isFreshValue };
};

interface AttributeStringListenerProps {
    path: string;
    mode: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export const useAttributeStringListener = (props: AttributeStringListenerProps) => {
    const { path, mode, onConnect, onDisconnect } = props;
    const [value, setValue] = useState<string>('');
    const [attribute, setAttribute] = useState<AttributeString | null>(null);
    const [connected, setConnected] = useState(false);
    const { triggerFresh, isFreshValue } = useFreshValue();
    const platform = usePlatform();

    const publish = (value: string) => {
        if (!attribute) return;

        if (attribute.mode === 'WO') {
            setValue(value);
        }
        attribute.publish(value);
    };

    useEffect(() => {
        if (platform.connectionState !== ConnectionState.Connected) {
            setAttribute(null);
        } else {
            const att = platform.attributes?.[path];

            if (!att || att.type !== 'string' || att.mode !== mode) {
                return;
            }

            const attString = att as AttributeString;

            setAttribute(attString);
            setValue(attString.value);
        }
    }, [platform.connectionState, platform.attributes, path, mode]);

    useEffect(() => {
        if (!attribute) {
            onDisconnect?.();
            setConnected(false);
        } else {
            onConnect?.();
            setConnected(true);
            if (attribute.mode !== 'WO') {
                const updateValue = () => {
                    setValue(attribute.value);
                    triggerFresh();
                };

                attribute.subscribe(updateValue);

                return () => {
                    attribute.unsubscribe(updateValue);
                };
            }
        }
    }, [attribute, triggerFresh, onConnect, onDisconnect]);

    return { value, publish, connected, isFreshValue };
};

interface AttributeEnumListenerProps {
    path: string;
    mode: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

import { EnumSettings } from '@/app/attribute';

export const useAttributeEnumListener = (props: AttributeEnumListenerProps) => {
    const { path, mode, onConnect, onDisconnect } = props;
    const [value, setValue] = useState<string>('');
    const [settings, setSettings] = useState<EnumSettings>({ choices: [] });
    const { triggerFresh, isFreshValue } = useFreshValue();
    const [attribute, setAttribute] = useState<AttributeEnum | null>(null);
    const [connected, setConnected] = useState(false);
    const platform = usePlatform();

    const publish = (value: string) => {
        if (!attribute) return;

        if (attribute.mode === 'WO') {
            setValue(value);
        }
        attribute.publish(value);
    };

    useEffect(() => {
        if (platform.connectionState !== ConnectionState.Connected) {
            setAttribute(null);
        } else {
            const att = platform.attributes?.[path];

            if (!att || att.type !== 'enum' || att.mode !== mode) {
                return;
            }

            const attEnum = att as AttributeEnum;

            setAttribute(attEnum);
            setValue(attEnum.value);
            setSettings(attEnum.settings as EnumSettings);
        }
    }, [platform.connectionState, platform.attributes, path, mode]);

    useEffect(() => {
        if (!attribute) {
            onDisconnect?.();
            setConnected(false);
        } else {
            onConnect?.();
            setConnected(true);
            if (attribute.mode !== 'WO') {
                const updateValue = () => {
                    setValue(attribute.value);
                    triggerFresh();
                };

                attribute.subscribe(updateValue);

                return () => {
                    attribute.unsubscribe(updateValue);
                };
            }
        }
    }, [attribute, triggerFresh, onConnect, onDisconnect]);

    return { value, settings, publish, connected, isFreshValue };
};

interface AttributeNumberListenerProps {
    path: string;
    mode: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export const useAttributeNumberListener = (props: AttributeNumberListenerProps) => {
    const { path, mode, onConnect, onDisconnect } = props;
    const [attribute, setAttribute] = useState<AttributeNumber | null>(null);
    const [connected, setConnected] = useState(false);
    const [value, setValue] = useState<number>(0);
    const { triggerFresh, isFreshValue } = useFreshValue();
    const platform = usePlatform();

    const publish = (value: number) => {
        if (!attribute) return;

        if (attribute.mode === 'WO') {
            setValue(value);
        }
        attribute.publish(value);
    };

    useEffect(() => {
        if (platform.connectionState !== ConnectionState.Connected) {
            setAttribute(null);
        } else {
            const att = platform.attributes?.[path];

            if (!att || att.type !== 'number' || att.mode !== mode) {
                return;
            }

            const attNumber = att as AttributeNumber;

            setAttribute(attNumber);
            setValue(attNumber.value);
        }
    }, [platform.connectionState, platform.attributes, path, mode]);

    useEffect(() => {
        if (!attribute) {
            onDisconnect?.();
            setConnected(false);
        } else {
            onConnect?.();
            setConnected(true);
            if (attribute.mode !== 'WO') {
                const updateValue = () => {
                    setValue(attribute.value);
                    triggerFresh();
                };

                attribute.subscribe(updateValue);

                return () => {
                    attribute.unsubscribe(updateValue);
                };
            }
        }
    }, [attribute, triggerFresh, onConnect, onDisconnect]);

    return { value, isFreshValue, connected, publish };
};

import { SiSettings } from '@/app/attribute';

interface AttributeSiListenerProps {
    path: string;
    mode: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export const useAttributeSiListener = (props: AttributeSiListenerProps) => {
    const { path, mode, onConnect, onDisconnect } = props;
    const [attribute, setAttribute] = useState<AttributeSi | null>(null);
    const [settings, setSettings] = useState<SiSettings>();
    const [value, setValue] = useState<number>(0);
    const { triggerFresh, isFreshValue } = useFreshValue();

    const [connected, setConnected] = useState(false);

    const platform = usePlatform();

    const publish = (value: number) => {
        if (!attribute) return;

        if (attribute.mode === 'WO') {
            setValue(value);
        }
        attribute.publish(value);
    };

    useEffect(() => {
        if (platform.connectionState !== ConnectionState.Connected) {
            setAttribute(null);
        } else {
            const att = platform.attributes?.[path];

            if (!att || att.type !== 'si' || att.mode !== mode) {
                return;
            }

            const attSi = att as AttributeSi;

            setAttribute(attSi);
            setValue(attSi.value);
            setSettings(attSi.settings as SiSettings);
        }
    }, [platform.connectionState, platform.attributes, path, mode]);

    useEffect(() => {
        if (!attribute) {
            onDisconnect?.();
            setConnected(false);
        } else {
            onConnect?.();
            setConnected(true);
            if (attribute.mode !== 'WO') {
                const updateValue = () => {
                    setValue(attribute.value);
                    triggerFresh();
                };
                attribute.subscribe(updateValue);

                return () => {
                    attribute.unsubscribe(updateValue);
                };
            }
        }
    }, [attribute, onConnect, triggerFresh, onDisconnect]);

    return { value, settings, isFreshValue, connected, publish };
};
