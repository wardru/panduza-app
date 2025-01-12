import { usePlatform } from './platform';
import { useEffect, useState } from 'react';
import { IStructure, IDriver, IClass } from './structure';
import { Allotment } from 'allotment';

import {
    Attribute,
    AttributeString,
    AttributeBool,
    AttributeSi,
    AttributeEnum,
    AttributeNumber,
    AttributeType,
} from './attribute';

import { Tree } from '../components/Tree';

import TreeData from '../components/Tree/TreeData';
import { useDndMonitor } from '@dnd-kit/core';

import { useTranslation } from 'react-i18next';

interface TreeViewProps {
    onAttributeSelect: (itemId: string | null) => void;
}

const TreeView: React.FC<TreeViewProps> = ({ onAttributeSelect }) => {
    const platform = usePlatform();
    const [tree, setTree] = useState<TreeData[]>();
    const [isDragging, setIsDragging] = useState(false);
    const { t } = useTranslation('explorer');

    useDndMonitor({
        onDragStart() {
            setIsDragging(true);
        },
        onDragEnd() {
            setIsDragging(false);
        },
        onDragCancel() {
            setIsDragging(false);
        },
    });

    useEffect(() => {
        const createAttributeTreeItem = (baseId: string, attributeName: string): TreeData => {
            return {
                label: attributeName,
                id: baseId + '/' + attributeName,
                type: 'attribute',
            };
        };

        const fillClassTree = (baseId: string, iclass: IClass): TreeData[] => {
            const classTree: TreeData[] = [];

            for (const className in iclass.classes) {
                const newId = baseId + '/' + className;
                const elem: TreeData = {
                    label: className,
                    id: newId,
                    type: 'class',
                    children: fillClassTree(newId, iclass.classes[className]),
                };
                classTree.push(elem);
            }

            for (const attributeName in iclass.attributes) {
                const attributeItem = createAttributeTreeItem(baseId, attributeName);
                classTree.push(attributeItem);
            }

            return classTree;
        };

        const fillDriverTree = (baseId: string, driver: IDriver): TreeData[] => {
            const driverTree: TreeData[] = [];

            for (const className in driver.classes) {
                const newId = baseId + '/' + className;
                const elem: TreeData = {
                    label: className,
                    id: newId,
                    type: 'class',
                    children: fillClassTree(newId, driver.classes[className]),
                };
                driverTree.push(elem);
            }

            for (const attributeName in driver.attributes) {
                const attributeItem = createAttributeTreeItem(baseId, attributeName);
                driverTree.push(attributeItem);
            }

            return driverTree;
        };

        const createTreeFromStructure = (structure: IStructure): TreeData[] => {
            const tree: TreeData[] = [];

            for (const driverName in structure.drivers) {
                const elem: TreeData = {
                    label: driverName,
                    id: driverName,
                    type: 'driver',
                    children: fillDriverTree(driverName, structure.drivers[driverName]),
                };
                tree.push(elem);
            }
            return tree;
        };

        if (!platform.structure) {
            onAttributeSelect(null);
            return;
        }
        setTree(createTreeFromStructure(platform.structure));
    }, [platform.structure, onAttributeSelect]);

    return (
        <div
            className={`text-white bg-gray-800 h-full w-full`}
            style={{
                overflow: isDragging ? 'hidden' : 'auto',
            }}
        >
            {tree && platform.structure ? (
                <Tree
                    openByDefault
                    items={tree}
                    onSelect={(id) => {
                        onAttributeSelect(id);
                    }}
                />
            ) : (
                <div className='h-full w-full bg-neutral-900 flex items-center justify-center'>
                    {t('no-platform')}..
                </div>
            )}
        </div>
    );
};

interface InfoPanelProps {
    item: string | null;
}

interface BoolWidgetProps {
    attribute: AttributeBool;
}

interface StringWidgetProps {
    attribute: AttributeString;
}

interface SiWidgetProps {
    attribute: AttributeSi;
}

interface EnumWidgetProps {
    attribute: AttributeEnum;
}

interface NumberWidgetProps {
    attribute: AttributeNumber;
}

const StringWidget: React.FC<StringWidgetProps> = ({ attribute }) => {
    const [value, setValue] = useState(attribute.value);

    useEffect(() => {
        const updateValue = () => setValue(attribute.value);

        attribute.subscribe(updateValue);

        return () => {
            attribute.unsubscribe(updateValue);
        };
    }, [attribute]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;

        const str = event.currentTarget.value;

        if (str === '') {
            return;
        }
        attribute.publish(str);
    };

    return (
        <div>
            {attribute.mode !== 'WO' ? <label className='text-white'>Value: {value}</label> : null}
            {attribute.mode !== 'RO' ? (
                <div>
                    <label> Set Value: </label>
                    <input
                        className='text-black'
                        onKeyDown={handleKeyDown}
                    />
                </div>
            ) : null}
        </div>
    );
};

const SiWidget: React.FC<SiWidgetProps> = ({ attribute }) => {
    const [value, setValue] = useState(attribute.value);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const updateValue = () => setValue(attribute.value);

        attribute.subscribe(updateValue);

        return () => {
            attribute.unsubscribe(updateValue);
        };
    }, [attribute]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') {
            return;
        }

        try {
            attribute.publish(Number(attribute.validateInput(event.currentTarget.value)));
            setError(null);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            setError(errorMessage);
        }
    };

    return (
        <div className='space-y-3'>
            {attribute.mode !== 'WO' ? (
                <p>
                    Value :{' '}
                    <input
                        className='text-black bg-white ml-1 px-2 py-1 rounded-md'
                        disabled={true}
                        value={value}
                    />{' '}
                    {attribute.unit}
                </p>
            ) : null}
            {attribute.mode !== 'RO' ? (
                <p>
                    Set Value:{' '}
                    <input
                        type='number'
                        className='text-black bg-white ml-1 px-2 py-1 rounded-md'
                        onKeyDown={handleKeyDown}
                    />
                </p>
            ) : null}
            {error && <p className='text-red-500 mt-2'>{error}</p>}
        </div>
    );
};

const BoolWidget: React.FC<BoolWidgetProps> = ({ attribute }) => {
    const [value, setValue] = useState(attribute.value);

    useEffect(() => {
        if (attribute.mode !== 'WO') {
            const updateValue = () => setValue(attribute.value);

            attribute.subscribe(updateValue);

            return () => {
                attribute.unsubscribe(updateValue);
            };
        }
    }, [attribute]);

    return (
        <div>
            {attribute.mode === 'WO' ? (
                <div className='flex space-x-3'>
                    <p> Shoot: </p>

                    <button
                        className='text-white hover:bg-neutral-900 bg-black ml-1 px-6 py-1 rounded-md'
                        onClick={() => attribute.publish(true)}
                    >
                        True
                    </button>
                    <button
                        className='text-white hover:bg-neutral-900 bg-black ml-1 px-6 py-1 rounded-md'
                        onClick={() => attribute.publish(false)}
                    >
                        False
                    </button>
                </div>
            ) : (
                <div>
                    Value:{' '}
                    <button
                        className='text-white hover:bg-neutral-900 bg-black ml-1 px-6 py-1 rounded-md'
                        onClick={() => attribute.publish(!value)}
                        disabled={attribute.mode === 'RO'}
                    >
                        {value ? 'true' : 'false'}
                    </button>
                </div>
            )}
        </div>
    );
};

const EnumWidget: React.FC<EnumWidgetProps> = ({ attribute }) => {
    const [value, setValue] = useState(attribute.value);

    useEffect(() => {
        const updateValue = () => {
            setValue(attribute.value);
        };

        attribute.subscribe(updateValue);

        return () => {
            attribute.unsubscribe(updateValue);
        };
    }, [attribute]);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        attribute.publish(event.currentTarget.value);

        if (attribute.mode === 'WO') {
            setValue(event.currentTarget.value);
        }
    };
    return (
        <div className='space-y-3'>
            <label> Value: </label>
            <select
                className='text-black placeholder:text-red-500'
                onChange={handleSelectChange}
                value={value}
                disabled={attribute.mode === 'RO'}
            >
                {attribute.choices.map((choice) => (
                    <option key={attribute.topic + '-' + choice}> {choice} </option>
                ))}
            </select>
        </div>
    );
};

const NumberWidget: React.FC<NumberWidgetProps> = ({ attribute }) => {
    const [value, setValue] = useState(attribute.value);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const updateValue = () => {
            setValue(attribute.value);
        };

        attribute.subscribe(updateValue);

        return () => {
            attribute.unsubscribe(updateValue);
        };
    }, [attribute]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') {
            return;
        }

        try {
            attribute.publish(Number(attribute.validateInput(event.currentTarget.value)));
            setError(null);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            setError(errorMessage);
            console.error(`Could not set value: {}`, e);
        }
    };

    return (
        <div className='space-y-3'>
            {attribute.mode !== 'WO' ? (
                <p>
                    Value :{' '}
                    <input
                        className='text-black bg-white ml-1 px-2 py-1 rounded-md'
                        disabled={true}
                        value={value}
                    />
                </p>
            ) : null}
            {attribute.mode !== 'RO' ? (
                <p>
                    Set Value:{' '}
                    <input
                        className='text-black bg-white ml-1 px-2 py-1 rounded-md'
                        onKeyDown={handleKeyDown}
                    />
                </p>
            ) : null}
            {error && <p className='text-red-500 mt-2'>{error}</p>}
        </div>
    );
};

const InfoPanel: React.FC<InfoPanelProps> = ({ item }) => {
    const platform = usePlatform();
    const { t } = useTranslation('explorer');

    const widgetFactoryMap: Record<string, (attribute: Attribute) => React.ReactElement> = {
        [AttributeType.Bool]: (attribute) => {
            return (
                <BoolWidget
                    key={attribute.topic}
                    attribute={attribute as AttributeBool}
                />
            );
        },
        [AttributeType.String]: (attribute) => {
            return (
                <StringWidget
                    key={attribute.topic}
                    attribute={attribute as AttributeString}
                />
            );
        },
        [AttributeType.Si]: (attribute) => {
            return (
                <SiWidget
                    key={attribute.topic}
                    attribute={attribute as AttributeSi}
                />
            );
        },
        [AttributeType.Enum]: (attribute) => {
            return (
                <EnumWidget
                    key={attribute.topic}
                    attribute={attribute as AttributeEnum}
                />
            );
        },
        [AttributeType.Number]: (attribute) => {
            return (
                <NumberWidget
                    key={attribute.topic}
                    attribute={attribute as AttributeNumber}
                />
            );
        },
    };

    const setNewWidget = (item: string) => {
        if (!platform.attributes) return null;

        const attribute = platform.attributes[item];

        if (!attribute) {
            return null;
        }

        const widget = widgetFactoryMap[attribute.type];

        if (!widget) {
            return null;
        }

        return (
            <div>
                <p>Attribute: {attribute.name}</p>
                <p>Classes: {attribute.parentClasses.join('/')}</p>
                <p>Driver: {attribute.parentDriver}</p>
                <p>Type: {attribute.type}</p>
                <p>Mode: {attribute.mode}</p>
                {attribute.info ? <p>Info: {attribute.info}</p> : null}
                <br />
                {widget(attribute)}
                <br />
            </div>
        );
    };

    return (
        <div className='h-full w-full text-white bg-neutral-800 overflow-auto'>
            <p>{t('info-panel')}</p>
            <p>------------------------</p>
            <br />
            {item ? setNewWidget(item) : null}
        </div>
    );
};

const Explorer: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    return (
        <Allotment vertical={true}>
            <TreeView onAttributeSelect={(itemId) => setSelectedItem(itemId)} />
            <InfoPanel item={selectedItem} />
        </Allotment>
    );
};

export default Explorer;
