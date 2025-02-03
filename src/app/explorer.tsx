import { useEffect, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { useDndMonitor } from '@dnd-kit/core';
import { Allotment } from 'allotment';

import { usePlatform } from './platform';
import { IStructure, IDriver, IClass } from './structure';
import { Tree } from '../components/Tree';
import TreeData from '../components/Tree/TreeData';
import { Accordion } from '@/components/Accordion';

import { InformationCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface TreeViewProps {
    onItemSelect: (itemId: string | null) => void;
}

const TreeView: React.FC<TreeViewProps> = ({ onItemSelect }) => {
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
            onItemSelect(null);
            return;
        }
        setTree(createTreeFromStructure(platform.structure));
    }, [platform.structure, onItemSelect]);

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
                        onItemSelect(id);
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

const InfoPanel: React.FC<InfoPanelProps> = ({ item }) => {
    const platform = usePlatform();
    const attribute = item ? platform.attributes?.[item] : null;
    const { t } = useTranslation('explorer');

    return (
        <div className='h-full w-full flex flex-col text-white bg-[#272727]'>
            <span className='flex items-center pt-2 pb-4 px-2 space-x-2'>
                <InformationCircleIcon className='size-5' />
                <label>{t('properties')}</label>
            </span>
            <div className='mx-2 overflow-auto'>
                {attribute?.settings ? (
                    <Accordion name={t('settings')}>
                        <div className='grid grid-cols-[auto_1fr] gap-x-0.5 gap-y-0.5 text-sm rounded-lg overflow-hidden'>
                            {Object.entries(attribute.settings).map(([key, value], index) => (
                                <Fragment key={index}>
                                    <label
                                        className='flex items-center bg-[#303030] px-6 py-1.5'
                                        style={{ textTransform: 'capitalize' }}
                                    >
                                        {key}
                                    </label>
                                    <div className='flex items-center px-0.5 py-0.5 bg-[#303030]'>
                                        {Array.isArray(value) ? (
                                            <div className='grid grid-cols-1 bg-[#171717] px-2.5 py-0.5 m-0.5 w-full'>
                                                {value.map((item, index) => (
                                                    <span key={index}>
                                                        {JSON.stringify(item).replace(/['"]+/g, '').trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className='bg-[#171717] flex items-center rounded-lg px-2 h-full w-full'>
                                                {JSON.stringify(value).replace(/['"]+/g, '').trim()}
                                            </div>
                                        )}
                                    </div>
                                </Fragment>
                            ))}
                        </div>
                    </Accordion>
                ) : null}
                {attribute?.info ? (
                    <Accordion name={t('info')}>
                        <div className='bg-[#1B1B1B] border border-[#355870] rounded-lg p-2 flex w-full'>
                            <LightBulbIcon className='flex-shrink-0 size-4 mx-1 my-1' />
                            <p className='pl-2 text-white break-words w-full'>{attribute.info}</p>
                        </div>
                    </Accordion>
                ) : null}
            </div>
        </div>
    );
};

const Explorer: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    return (
        <Allotment vertical={true}>
            <TreeView onItemSelect={(itemId) => setSelectedItem(itemId)} />
            <InfoPanel item={selectedItem} />
        </Allotment>
    );
};

export default Explorer;
