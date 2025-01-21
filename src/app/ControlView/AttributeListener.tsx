import { ConnectionState, usePlatform } from '../platform';

import { useEffect, useState, useMemo, useRef } from 'react';

import { AttributeBool, AttributeString, AttributeEnum, AttributeNumber, AttributeSi } from '@/app/attribute';

interface AttributeBoolListenerProps {
    attribute: AttributeBool;
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
    const { attribute, onConnect, onDisconnect } = props;
    const [localAttribute, setLocalAttribute] = useState<AttributeBool | null>(attribute);
    const [connected, setConnected] = useState(false);
    const [value, setValue] = useState(props.attribute.value);
    const { triggerFresh, isFreshValue } = useFreshValue();
    const initialAttributeData = useMemo(() => {
        return {
            path: attribute.path,
            mode: attribute.mode,
        };
    }, [attribute]);
    const platform = usePlatform();

    const publish = (value: boolean) => {
        if (!localAttribute) return;

        if (localAttribute.mode === 'WO') {
            setValue(value);
        }
        localAttribute.publish(value);
    };

    useEffect(() => {
        if (platform.connectionState !== ConnectionState.Connected) {
            setLocalAttribute(null);
        } else {
            const att = platform.attributes?.[initialAttributeData.path];

            if (!att || att.type !== 'boolean' || att.mode !== initialAttributeData.mode) {
                return;
            }

            setLocalAttribute(att as AttributeBool);
        }
    }, [platform.connectionState, platform.attributes, initialAttributeData]);

    useEffect(() => {
        if (!localAttribute) {
            onDisconnect?.();
            setConnected(false);
        } else {
            onConnect?.();
            setConnected(true);
            if (localAttribute.mode !== 'WO') {
                const updateValue = () => {
                    setValue(localAttribute.value);
                    triggerFresh();
                };

                localAttribute.subscribe(updateValue);

                return () => {
                    localAttribute.unsubscribe(updateValue);
                };
            }
        }
    }, [localAttribute, triggerFresh, onConnect, onDisconnect]);

    return { value, publish, connected, isFreshValue };
};

interface AttributeStringListenerProps {
    attribute: AttributeString;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export const useAttributeStringListener = (props: AttributeStringListenerProps) => {
    const { attribute, onConnect, onDisconnect } = props;
    const [value, setValue] = useState(props.attribute.value);
    const [localAttribute, setLocalAttribute] = useState<AttributeString | null>(attribute);
    const [connected, setConnected] = useState(false);
    const { triggerFresh, isFreshValue } = useFreshValue();
    const initialAttributeData = useMemo(() => {
        return {
            path: attribute.path,
            mode: attribute.mode,
        };
    }, [attribute]);
    const platform = usePlatform();

    const publish = (value: string) => {
        if (!localAttribute) return;

        if (localAttribute.mode === 'WO') {
            setValue(value);
        }
        localAttribute.publish(value);
    };

    useEffect(() => {
        if (platform.connectionState !== ConnectionState.Connected) {
            setLocalAttribute(null);
        } else {
            const att = platform.attributes?.[initialAttributeData.path];

            if (!att || att.type !== 'string' || att.mode !== initialAttributeData.mode) {
                return;
            }

            setLocalAttribute(att as AttributeString);
        }
    }, [platform.connectionState, platform.attributes, initialAttributeData]);

    useEffect(() => {
        if (!localAttribute) {
            onDisconnect?.();
            setConnected(false);
        } else {
            onConnect?.();
            setConnected(true);
            if (localAttribute.mode !== 'WO') {
                const updateValue = () => {
                    setValue(localAttribute.value);
                    triggerFresh();
                };

                localAttribute.subscribe(updateValue);

                return () => {
                    localAttribute.unsubscribe(updateValue);
                };
            }
        }
    }, [localAttribute, triggerFresh, onConnect, onDisconnect]);

    return { value, publish, connected, isFreshValue };
};

interface AttributeEnumListenerProps {
    attribute: AttributeEnum;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

import { EnumSettings } from '@/app/attribute';

export const useAttributeEnumListener = (props: AttributeEnumListenerProps) => {
    const { attribute, onConnect, onDisconnect } = props;
    const [value, setValue] = useState(props.attribute.value);
    const [settings, setSettings] = useState<EnumSettings>({
        choices: props.attribute.choices,
    });
    const { triggerFresh, isFreshValue } = useFreshValue();
    const [localAttribute, setLocalAttribute] = useState<AttributeEnum | null>(attribute);
    const [connected, setConnected] = useState(false);
    const initialAttributeData = useMemo(() => {
        return {
            path: attribute.path,
            mode: attribute.mode,
        };
    }, [attribute]);
    const platform = usePlatform();

    const publish = (value: string) => {
        if (!localAttribute) return;

        if (localAttribute.mode === 'WO') {
            setValue(value);
        }
        localAttribute.publish(value);
    };

    useEffect(() => {
        if (platform.connectionState !== ConnectionState.Connected) {
            setLocalAttribute(null);
        } else {
            const att = platform.attributes?.[initialAttributeData.path];

            if (!att || att.type !== 'enum' || att.mode !== initialAttributeData.mode) {
                return;
            }

            setLocalAttribute(att as AttributeEnum);
        }
    }, [platform.connectionState, platform.attributes, initialAttributeData]);

    useEffect(() => {
        if (!localAttribute) {
            onDisconnect?.();
            setConnected(false);
        } else {
            onConnect?.();
            setConnected(true);
            if (localAttribute.mode !== 'WO') {
                const updateValue = () => {
                    setValue(localAttribute.value);
                    setSettings({
                        choices: localAttribute.choices,
                    });
                    triggerFresh();
                };

                localAttribute.subscribe(updateValue);

                return () => {
                    localAttribute.unsubscribe(updateValue);
                };
            }
        }
    }, [localAttribute, triggerFresh, onConnect, onDisconnect]);

    return { value, settings, publish, connected, isFreshValue };
};

interface AttributeNumberListenerProps {
    attribute: AttributeNumber;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export const useAttributeNumberListener = (props: AttributeNumberListenerProps) => {
    const { attribute, onConnect, onDisconnect } = props;
    const [localAttribute, setLocalAttribute] = useState<AttributeNumber | null>(attribute);
    const [connected, setConnected] = useState(false);
    const [value, setValue] = useState(props.attribute.value);
    const { triggerFresh, isFreshValue } = useFreshValue();
    const initialAttributeData = useMemo(() => {
        return {
            path: attribute.path,
            mode: attribute.mode,
        };
    }, [attribute]);
    const platform = usePlatform();

    const publish = (value: number) => {
        if (!localAttribute) return;

        if (localAttribute.mode === 'WO') {
            setValue(value);
        }
        localAttribute.publish(value);
    };

    useEffect(() => {
        if (platform.connectionState !== ConnectionState.Connected) {
            setLocalAttribute(null);
        } else {
            const att = platform.attributes?.[initialAttributeData.path];

            if (!att || att.type !== 'number' || att.mode !== initialAttributeData.mode) {
                return;
            }

            setLocalAttribute(att as AttributeNumber);
        }
    }, [platform.connectionState, platform.attributes, initialAttributeData]);

    useEffect(() => {
        if (!localAttribute) {
            onDisconnect?.();
            setConnected(false);
        } else {
            onConnect?.();
            setConnected(true);
            if (localAttribute.mode !== 'WO') {
                const updateValue = () => {
                    setValue(localAttribute.value);
                    triggerFresh();
                };

                localAttribute.subscribe(updateValue);

                return () => {
                    localAttribute.unsubscribe(updateValue);
                };
            }
        }
    }, [localAttribute, triggerFresh, onConnect, onDisconnect]);

    return { value, isFreshValue, connected, publish };
};

import { SiSettings } from '@/app/attribute';

interface AttributeSiListenerProps {
    attribute: AttributeSi;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export const useAttributeSiListener = (props: AttributeSiListenerProps) => {
    const { attribute, onConnect, onDisconnect } = props;
    const [localAttribute, setLocalAttribute] = useState<AttributeSi | null>(attribute);
    const [settings, setSettings] = useState<SiSettings>({
        min: props.attribute.min,
        max: props.attribute.max,
        decimals: props.attribute.decimals,
        unit: props.attribute.unit,
    });
    const [value, setValue] = useState(props.attribute.value);
    const { triggerFresh, isFreshValue } = useFreshValue();
    const initialAttributeData = useMemo(() => {
        return {
            path: attribute.path,
            mode: attribute.mode,
        };
    }, [attribute]);

    const [connected, setConnected] = useState(false);

    const platform = usePlatform();

    const publish = (value: number) => {
        if (!localAttribute) return;

        if (localAttribute.mode === 'WO') {
            setValue(value);
        }
        localAttribute.publish(value);
    };

    useEffect(() => {
        if (platform.connectionState !== ConnectionState.Connected) {
            setLocalAttribute(null);
        } else {
            const att = platform.attributes?.[initialAttributeData.path];

            if (!att || att.type !== 'si' || att.mode !== initialAttributeData.mode) {
                return;
            }

            setLocalAttribute(att as AttributeSi);
        }
    }, [platform.connectionState, platform.attributes, initialAttributeData]);

    useEffect(() => {
        if (!localAttribute) {
            onDisconnect?.();
            setConnected(false);
        } else {
            onConnect?.();
            setConnected(true);
            if (localAttribute.mode !== 'WO') {
                const updateValue = () => {
                    setValue(localAttribute.value);
                    setSettings({
                        min: localAttribute.min,
                        max: localAttribute.max,
                        unit: localAttribute.unit,
                        decimals: localAttribute.decimals,
                    });
                    triggerFresh();
                };
                localAttribute.subscribe(updateValue);

                return () => {
                    localAttribute.unsubscribe(updateValue);
                };
            }
        }
    }, [localAttribute, onConnect, triggerFresh, onDisconnect]);

    return { value, settings, isFreshValue, connected, publish };
};
