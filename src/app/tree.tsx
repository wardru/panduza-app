import { RichTreeView, TreeItem2 } from "@mui/x-tree-view";
import { usePlatform, PlatformContextType, ConnectionState } from './platform';
import { useEffect, useState } from 'react';
import { IStructure, IDriver, IClass, IAttribute } from "./structure";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";

type ExtendedTreeItemProps = {
    id: string,
    label: string,
    type: string,
    attributeType?: string
}

type TreeItemProps = TreeViewBaseItem<ExtendedTreeItemProps>;

const TreeView: React.FC = () => {
    const platform = usePlatform();
    const [tree, setTree] = useState<TreeItemProps[]>([]);

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
        console.log(tree);
        return tree;
    }

    useEffect(() => {
        if (!platform.structure) {
            return ;
        }
        setTree(createTreeFromStructure(platform.structure));
    }, [platform.structure]);
    

    return (
        <div className="text-white bg-gray-800 h-full w-full">
            {platform.structure ?
                <RichTreeView items={tree}/>
                :
                <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
                    No platform connected..
                </div>
            }
        </div>
    );
}

const TreePanel: React.FC = () => {
    return (
        <TreeView/>
    );
}

export default TreePanel;
