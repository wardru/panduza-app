import { RichTreeView, TreeItem2 } from "@mui/x-tree-view";
import { usePlatform, PlatformContextType, ConnectionState } from './platform';
import { useEffect, useState } from 'react';
import { IStructure, IDriver, IClass, IAttribute } from "./structure";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { Allotment } from "allotment";

import { Attribute, AttributeString, AttributeBool } from './attribute';

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

    const createAttributeTreeItem = (baseId: string, attributeName: string, attribute: IAttribute): TreeItemProps => {
        return {
            label: attributeName,
            id: baseId + "/" + attributeName,
            type: "attribute",
            attributeType: attribute.type
        }
    }

    const fillClassTree = (baseId: string, iclass: IClass): TreeItemProps[] => {
        let classTree: TreeItemProps[] = [];

        for (const className in iclass.classes) {
            let newId = baseId + "/" + className;
            let elem: TreeItemProps = {
                label: className,
                id: newId,
                type: "class",
                children: fillClassTree(newId, iclass.classes[className])
            }
            classTree.push(elem);
        }

        for (const attributeName in iclass.attributes) {
            let attributeItem = createAttributeTreeItem(baseId, attributeName, iclass.attributes[attributeName]);
            classTree.push(attributeItem);
        }

        return classTree;
    }

    const fillDriverTree = (baseId: string, driver: IDriver): TreeItemProps[] => {
        let driverTree: TreeItemProps[] = [];

        for (const className in driver.classes) {
            let newId = baseId + "/" + className;

            let elem: TreeItemProps = {
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
        let tree: TreeItemProps[] = [];
        
        for (const driverName in structure.drivers) {
            let elem: TreeItemProps = {
                label: driverName,
                id: driverName,
                type: "driver",
                children: fillDriverTree(driverName, structure.drivers[driverName])
            }
            tree.push(elem);
        }
        return tree;
    }

    useEffect(() => {
        if (!platform.structure) {
            onAttributeSelect(null);
            return ;
        }
        setTree(createTreeFromStructure(platform.structure));
    }, [platform.structure]);
    
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

const BoolWidget: React.FC<BoolWidgetProps> = ({ attribute }) => {
    const [value, setValue] = useState(attribute.value);

    useEffect(() => {
        const updateValue = () => setValue(attribute.value);

        // Subscribe to updates from the attribute
        attribute.subscribe(updateValue);

        // Cleanup subscription when unmounting
        return () => {
            attribute.unsubscribe(updateValue);
        };
    }, [attribute]);

    return (
        <div>
            <button className="bg-red-300" onClick={() => attribute.setValue(!value)}>
                {value ? "true" : "false"}
            </button>
        </div>
    );
};

const InfoPanel: React.FC<InfoPanelProps> = ({item}) => {
    const platform = usePlatform();

    const setStringWidget = (attribute: AttributeString) => {
        return (
            <div>
                <input value={"efe"}/>
               {attribute.name} 
            </div>
        );
    }

    const setNewWidget = (item: string) => {
        console.log(`cucu ${item}`);
        let attribute = platform.attributes[item];

        if (!attribute) {
            return null;
        }
        if (attribute.type === "string") {
            return setStringWidget(attribute as AttributeString);
        } else if (attribute.type === "boolean") {
            return <BoolWidget key={attribute.topic} attribute={attribute as AttributeBool} />;
        }
        return null;
    }

    return (
        <div className="h-full w-full bg-yellow-900 overflow-auto">
            Info panel
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
