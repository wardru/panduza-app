import { ConnectionState, usePlatform } from '../platform';

import { useEffect, useState, useMemo } from 'react';

import { AttributeBool, AttributeString, AttributeEnum, AttributeNumber, AttributeSi } from '@/app/attribute';

interface AttributeBoolListenerProps {
    attribute: AttributeBool;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onNewValue?: (value: boolean) => void;
}

export const useAttributeBoolListener = (props: AttributeBoolListenerProps) => {
    const { attribute, onConnect, onDisconnect, onNewValue } = props;
    const [localAttribute, setLocalAttribute] = useState<AttributeBool | null>(attribute);
    const [disabled, setDisabled] = useState(false);
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
            onNewValue?.(value);
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
            setDisabled(true);
        } else {
            onConnect?.();
            setDisabled(false);
            if (localAttribute.mode !== 'WO') {
                const updateValue = () => onNewValue?.(localAttribute.value);

                localAttribute.subscribe(updateValue);

                return () => {
                    localAttribute.unsubscribe(updateValue);
                };
            }
        }
    }, [localAttribute, onNewValue, onConnect, onDisconnect]);

    return { publish, disabled };
};

interface AttributeStringListenerProps {
    attribute: AttributeString;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onNewValue?: (value: string) => void;
}

export const useAttributeStringListener = (props: AttributeStringListenerProps) => {
    const { attribute, onConnect, onDisconnect, onNewValue } = props;
    const [localAttribute, setLocalAttribute] = useState<AttributeString | null>(attribute);
    const [disabled, setDisabled] = useState(false);
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
            onNewValue?.(value);
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
            setDisabled(true);
        } else {
            onConnect?.();
            setDisabled(false);
            if (localAttribute.mode !== 'WO') {
                const updateValue = () => onNewValue?.(localAttribute.value);

                localAttribute.subscribe(updateValue);

                return () => {
                    localAttribute.unsubscribe(updateValue);
                };
            }
        }
    }, [localAttribute, onNewValue, onConnect, onDisconnect]);

    return { publish, disabled };
};

interface AttributeEnumListenerProps {
    attribute: AttributeEnum;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onNewValue?: (value: string) => void;
}

export const useAttributeEnumListener = (props: AttributeEnumListenerProps) => {
    const { attribute, onConnect, onDisconnect, onNewValue } = props;
    const [localAttribute, setLocalAttribute] = useState<AttributeEnum | null>(attribute);
    const [disabled, setDisabled] = useState(false);
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
            onNewValue?.(value);
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
            setDisabled(true);
        } else {
            onConnect?.();
            setDisabled(false);
            if (localAttribute.mode !== 'WO') {
                const updateValue = () => onNewValue?.(localAttribute.value);

                localAttribute.subscribe(updateValue);

                return () => {
                    localAttribute.unsubscribe(updateValue);
                };
            }
        }
    }, [localAttribute, onNewValue, onConnect, onDisconnect]);

    return { publish, disabled };
};

interface AttributeNumberListenerProps {
    attribute: AttributeNumber;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onNewValue?: (value: number) => void;
}

export const useAttributeNumberListener = (props: AttributeNumberListenerProps) => {
    const { attribute, onConnect, onDisconnect, onNewValue } = props;
    const [localAttribute, setLocalAttribute] = useState<AttributeNumber | null>(attribute);
    const [disabled, setDisabled] = useState(false);
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
            onNewValue?.(value);
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
            setDisabled(true);
        } else {
            onConnect?.();
            setDisabled(false);
            if (localAttribute.mode !== 'WO') {
                const updateValue = () => onNewValue?.(localAttribute.value);

                localAttribute.subscribe(updateValue);

                return () => {
                    localAttribute.unsubscribe(updateValue);
                };
            }
        }
    }, [localAttribute, onNewValue, onConnect, onDisconnect]);

    return { disabled, publish };
};

import { SiSettings } from '@/app/attribute';

interface AttributeSiListenerProps {
    attribute: AttributeSi;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onNewData?: (value: number, settings: SiSettings) => void;
}

export const useAttributeSiListener = (props: AttributeSiListenerProps) => {
    const { attribute, onConnect, onDisconnect, onNewData } = props;
    const [localAttribute, setLocalAttribute] = useState<AttributeSi | null>(attribute);
    const initialAttributeData = useMemo(() => {
        return {
            path: attribute.path,
            mode: attribute.mode,
        };
    }, [attribute]);

    const [disabled, setDisabled] = useState(false);

    const platform = usePlatform();

    const publish = (value: number) => {
        if (!localAttribute) return;

        if (localAttribute.mode === 'WO') {
            onNewData?.(value, {
                min: localAttribute.min,
                max: localAttribute.max,
                unit: localAttribute.unit,
                decimals: localAttribute.decimals,
            });
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
            setDisabled(true);
        } else {
            onConnect?.();
            setDisabled(false);
            if (localAttribute.mode !== 'WO') {
                const updateValue = () =>
                    onNewData?.(localAttribute.value, {
                        min: localAttribute.min,
                        max: localAttribute.max,
                        unit: localAttribute.unit,
                        decimals: localAttribute.decimals,
                    });

                localAttribute.subscribe(updateValue);

                return () => {
                    localAttribute.unsubscribe(updateValue);
                };
            }
        }
    }, [localAttribute, onNewData, onConnect, onDisconnect]);

    return { disabled, publish };
};
