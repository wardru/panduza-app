import { RichTreeView} from "@mui/x-tree-view";
import { usePlatform} from './platform';
import { useEffect, useState } from 'react';
import { IStructure, IDriver, IClass, IAttribute } from "./structure";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { Allotment } from "allotment";

import { Attribute, AttributeString, AttributeBool, AttributeSi, AttributeType} from './attribute';

type ExtendedTreeItemProps = {
    id: string,
    label: string,
    type: string,
    attributeType?: string
}

type TreeItemProps = TreeViewBaseItem<ExtendedTreeItemProps>;

interface TreeViewProps {
    onAttributeSelect: (itemId: string | null) => void;
}

const TreeView: React.FC<TreeViewProps> = ({ onAttributeSelect }) => {
    const platform = usePlatform();
    const [tree, setTree] = useState<TreeItemProps[]>([]);
    const apiRef = useTreeViewApiRef();



    useEffect(() => {
        const createAttributeTreeItem = (baseId: string, attributeName: string, attribute: IAttribute): TreeItemProps => {
            return {
                label: attributeName,
                id: baseId + "/" + attributeName,
                type: "attribute",
                attributeType: attribute.type
            }
        }

        const fillClassTree = (baseId: string, iclass: IClass): TreeItemProps[] => {
            const classTree: TreeItemProps[] = [];

            for (const className in iclass.classes) {
                const newId = baseId + "/" + className;
                const elem: TreeItemProps = {
                    label: className,
                    id: newId,
                    type: "class",
                    children: fillClassTree(newId, iclass.classes[className])
                }
                classTree.push(elem);
            }

            for (const attributeName in iclass.attributes) {
                const attributeItem = createAttributeTreeItem(baseId, attributeName, iclass.attributes[attributeName]);
                classTree.push(attributeItem);
            }

            return classTree;
        }

        const fillDriverTree = (baseId: string, driver: IDriver): TreeItemProps[] => {
            const driverTree: TreeItemProps[] = [];

            for (const className in driver.classes) {
                const newId = baseId + "/" + className;
                const elem: TreeItemProps = {
                    label: className,
                    id: newId,
                    type: "class",
                    children: fillClassTree(newId, driver.classes[className])
                }
                driverTree.push(elem);
            }

            for (const attributeName in driver.attributes) {
                const attributeItem = createAttributeTreeItem(baseId, attributeName, driver.attributes[attributeName]);
                driverTree.push(attributeItem);
            }

            return driverTree;
        }

        const createTreeFromStructure = (structure: IStructure): TreeItemProps[] => {
            const tree: TreeItemProps[] = [];

            for (const driverName in structure.drivers) {
                const elem: TreeItemProps = {
                    label: driverName,
                    id: driverName,
                    type: "driver",
                    children: fillDriverTree(driverName, structure.drivers[driverName])
                }
                tree.push(elem);
            }
            return tree;
        }

        if (!platform.structure) {
            onAttributeSelect(null);
            return ;
        }
        setTree(createTreeFromStructure(platform.structure));
    }, [platform.structure, onAttributeSelect]);
    
    const handleItemSelect = (event: React.SyntheticEvent | null, itemId: string) => {
        const item = apiRef.current!.getItem(itemId);

        if (item && item.type === "attribute") {
            onAttributeSelect(itemId);
        }
    }

    return (
        <div className="text-white bg-gray-800 h-full w-full overflow-auto">
            {platform.structure ?
                <RichTreeView apiRef={apiRef} items={tree} onItemFocus={handleItemSelect}/>
                :
                <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
                    No platform connected..
                </div>
            }
        </div>
    );
}

interface InfoPanelProps {
    item: string | null
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

const StringWidget: React.FC<StringWidgetProps> = ({ attribute }) => {
    const [value, setValue] = useState(attribute.value);

    useEffect(() => {
        const updateValue = () => setValue(attribute.value);

        attribute.subscribe(updateValue);

        return () => {
            attribute.unsubscribe(updateValue);
        };
    }, [attribute]);

    return (
        <div>
            Value: {value}
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
            return ;
        }

        try {
            attribute.setValue(event.currentTarget.value);
            setError(null);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            setError(errorMessage);
            console.error(`Could not set value: {}`, e);
        }
    }

    return (
        <div className="space-y-3">
            {
                attribute.mode !== "WO" ?
                    <p>Value : <input className="text-black bg-white ml-1 px-2 py-1 rounded-md" disabled={true} value={value}/></p>
                    : null
            }
            {
                attribute.mode !== "RO" ?
                <p>SetValue: <input className="text-black bg-white ml-1 px-2 py-1 rounded-md" onKeyDown={handleKeyDown}/></p>
                : null
            }
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    )
}

const BoolWidget: React.FC<BoolWidgetProps> = ({ attribute }) => {
    const [value, setValue] = useState(attribute.value);

    useEffect(() => {
        const updateValue = () => setValue(attribute.value);

        attribute.subscribe(updateValue);

        return () => {
            attribute.unsubscribe(updateValue);
        };
    }, [attribute]);

    return (
        <div>
            Value: <button
                        className="text-white hover:bg-neutral-900 bg-black ml-1 px-6 py-1 rounded-md"
                        onClick={() => attribute.setValue(!value)}
                        disabled={attribute.mode === "RO"}
                    >
                {value ? "true" : "false"}
            </button>
        </div>
    );
};

const InfoPanel: React.FC<InfoPanelProps> = ({item}) => {
    const platform = usePlatform();

    const widgetFactoryMap: Record<string, (attribute: Attribute) => React.ReactElement> = {
        [AttributeType.Bool]: (attribute) => { return <BoolWidget key={attribute.name} attribute={attribute as AttributeBool}/> },
        [AttributeType.String]: (attribute) => { return <StringWidget key={attribute.name} attribute={attribute as AttributeString}/> },
        [AttributeType.Si]: (attribute) => { return <SiWidget key={attribute.name} attribute={attribute as AttributeSi}/> },
    }

    const setNewWidget = (item: string) => {
        const attribute = platform.attributes[item];

        if (!attribute) {
            return null;
        }

        const widget = widgetFactoryMap[attribute.type](attribute);

        if (!widget) {
            return null;
        }
     
        return (
            <div>
                <p>Attribute: {attribute.name}</p>
                <p>Classes: {attribute.parentClasses.join('/')}</p>
                <p>Driver: {attribute.parentDriver}</p>
                <br/>
                {widget}
                <br/>
            </div>
        );
    }

    return (
        <div className="h-full w-full text-white bg-neutral-800 overflow-auto">
            <p>Info panel</p>
            <p>------------------------</p>
            <br/>
            {item ?
                setNewWidget(item)
                :
                null
            }
        </div>
    )
}

const TreePanel: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    return (
        <Allotment vertical={true}>
            <TreeView onAttributeSelect={(itemId) => setSelectedItem(itemId)}/>
            <InfoPanel item={selectedItem}/>
        </Allotment>
    );
}

export default TreePanel;
