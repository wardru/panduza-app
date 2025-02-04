import { useEffect, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { Allotment } from 'allotment';

import { usePlatform } from './platform';
import { IStructure, IDriver, IClass } from './structure';
import { Tree } from './components/Tree';
import TreeData from './components/Tree/TreeData';
import { Accordion } from './components/Accordion';

import { InformationCircleIcon, LightBulbIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface TreeViewProps {
    onItemSelect: (itemId: string | null) => void;
}

const TreeView: React.FC<TreeViewProps> = ({ onItemSelect }) => {
    const platform = usePlatform();
    const [tree, setTree] = useState<TreeData[]>();
    const { t } = useTranslation('explorer');

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
        <div className={`bg-secondary flex size-full flex-col`}>
            <span className='border-secondary-border mb-2 flex items-center space-x-2 border-b px-4 py-2'>
                <ComputerDesktopIcon className='size-5' />
                <label>{t('drivers')}</label>
            </span>
            {tree && platform.structure ? (
                <Tree
                    openByDefault
                    items={tree}
                    onSelect={(id) => {
                        onItemSelect(id);
                    }}
                />
            ) : (
                <div className='flex size-full items-center justify-center'>{t('no-platform')}..</div>
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
        <div className='bg-secondary flex size-full flex-col'>
            <span className='border-secondary-border mb-2 flex items-center space-x-2 border-b px-4 py-2'>
                <InformationCircleIcon className='size-5' />
                <label>{t('properties')}</label>
            </span>
            <div className='mx-2 overflow-auto'>
                {attribute?.settings ? (
                    <Accordion name={t('settings')}>
                        <div className='grid grid-cols-[auto_1fr] gap-x-0.5 gap-y-0.5 overflow-hidden rounded-lg text-sm'>
                            {Object.entries(attribute.settings).map(([key, value], index) => (
                                <Fragment key={index}>
                                    <label
                                        className='flex items-center bg-[#353535] px-6 py-1.5'
                                        style={{ textTransform: 'capitalize' }}
                                    >
                                        {key}
                                    </label>
                                    <div className='flex items-center bg-[#303030] px-0.5 py-0.5'>
                                        {Array.isArray(value) ? (
                                            <div className='bg-box-readonly m-0.5 grid w-full grid-cols-1 px-2.5 py-0.5'>
                                                {value.map((item, index) => (
                                                    <span key={index}>
                                                        {JSON.stringify(item).replace(/['"]+/g, '').trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className='bg-box-readonly flex h-full w-full items-center rounded-lg px-2'>
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
                        <div className='border-active bg-box-readonly flex w-full rounded-lg border p-2'>
                            <LightBulbIcon className='mx-1 my-1 size-4 shrink-0' />
                            <p className='w-full pl-2 break-words'>{attribute.info}</p>
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
        <Allotment
            vertical={true}
            defaultSizes={[2, 1]}
        >
            <TreeView onItemSelect={(itemId) => setSelectedItem(itemId)} />
            <InfoPanel item={selectedItem} />
        </Allotment>
    );
};

export default Explorer;
