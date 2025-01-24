import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDndMonitor } from '@dnd-kit/core';
import { Allotment } from 'allotment';

import { usePlatform } from './platform';
import { IStructure, IDriver, IClass } from './structure';
import { Tree } from '../components/Tree';
import TreeData from '../components/Tree/TreeData';

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

const InfoPanel: React.FC<InfoPanelProps> = ({ item }) => {
    const platform = usePlatform();
    const attribute = item ? platform.attributes?.[item] : null;
    const { t } = useTranslation('explorer');

    return (
        <div className='h-full w-full text-white bg-neutral-800 overflow-auto'>
            <label>{t('properties')}</label>
            <p>------------------------</p>
            <br />
            {attribute ? (
                <div>
                    <p>Attribute: {attribute.name}</p>
                    <p>Classes: {attribute.parentClasses.join('/')}</p>
                    <p>Driver: {attribute.parentDriver}</p>
                    <p>Type: {attribute.type}</p>
                    <p>Mode: {attribute.mode}</p>
                    {attribute.info ? <p>Info: {attribute.info}</p> : null}
                </div>
            ) : null}
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
