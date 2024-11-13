'use client';

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import {useState, useEffect, useRef} from 'react';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { listen } from '@tauri-apps/api/event';
import { invoke } from "@tauri-apps/api/core";
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';

interface Attribute {
    info?: string | null;
    mode: string,
    type: string,
    settings?: any | null
}

interface Class {
    attributes: {[key: string]: Attribute};
    classes: {[key: string]: Class};
    info?: string | null;   
}

interface Driver {
    attributes: {[key: string]: Attribute};
    classes: {[key: string]: Class};
    info?: string | null;   
}

interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
}

interface Structure {
    driver_instances: {[key: string]: Driver };
}

type Item = TreeViewBaseItem<{
    id: string,
    label: string,
}>;

interface AttributeWithPath {
  path: string;
  attribute: Attribute;
}

interface AttributeStringProps {
    attribute: AttributeWithPath;
}

interface AttributeSIProps {
    attribute: AttributeWithPath;
    unit?: string;
}

const AttributeSI: React.FC<AttributeSIProps> = ({ attribute}) => {

  let [value, setValue] = useState(NaN);
  let [boxValue, setBoxValue] = useState('');
  let lastSubmittedValue = useRef('');
  

    useEffect(() => {
      console.log(`listening to ${attribute.path}`);
      listen<number>("pza/"+attribute.path, (event) => {
        console.log(`HA ${attribute.path}`);
        setValue(event.payload);

      });
    }, []);

    
    const sup = (event: React.KeyboardEvent) => {
    if (event.key   
 === 'Enter') {
      // Do something with the input value here, e.g., submit it to a server

      if (lastSubmittedValue.current === boxValue) {
        return;
      }
      lastSubmittedValue.current = boxValue;
      console.log('Submitted value:', boxValue);
      invoke('new_value', {topic: "pza/"+attribute.path, value: Number(boxValue)});
    }
  };

    const { path } = attribute;
    const unit = 'V';
    return (
        <div>
            <p>Name: {path}</p>
            <p>Type: SI</p>
            <p>Value: {value} {unit}</p>
            <input className="text-black" type="number" value={boxValue} onChange={(e) => {setBoxValue(e.target.value)}} onKeyDown={sup}/>
        </div>
    );
};


const AttributeString: React.FC<AttributeStringProps> = ({ attribute }) => {

    let [value, setValue] = useState("Unknown");

    useEffect(() => {
      console.log(`listening to ${attribute.path}`);
      listen<string>("pza/"+attribute.path, (event) => {
        console.log(`HA ${attribute.path}`);
        setValue(event.payload);

      });
    }, []);

    const { path } = attribute;
    return (
        <div>
            <p>Name: {path}</p>
            <p>Type: string</p>
            <p>Value: {value}</p>
        </div>
    );
};



const Tree = () => {

    const [lol, setLol] = useState<Structure | null>(null);

useEffect(() => {
        listen<Structure>('structure', (event) => {
            setLol(event.payload);
        });

        listen<string>('connect', (event) => {
          if (event.payload == "false")
              setLol(null);
        });
    }, []);

    // Function to collect attributes from a class, keeping track of the path
const collectAttributesFromClass = (
  classInstance: Class,
  basePath: string,
  attributes: AttributeWithPath[]
): void => {
  // Collect attributes in this class
  for (const attributeKey in classInstance.attributes) {
    const attributePath = `${basePath}/${attributeKey}`;
    attributes.push({
      path: attributePath,
      attribute: classInstance.attributes[attributeKey],
    });
  }

  // Recursively collect attributes from nested classes
  for (const nestedClassKey in classInstance.classes) {
    const classPath = `${basePath}/${nestedClassKey}`;
    collectAttributesFromClass(classInstance.classes[nestedClassKey], classPath, attributes);
  }
};

// Function to collect attributes from a driver, keeping track of the path
const collectAttributesFromDriver = (
  driver: Driver,
  driverKey: string,
  attributes: AttributeWithPath[]
): void => {
  // Collect attributes in this driver
  for (const attributeKey in driver.attributes) {
    const attributePath = `${driverKey}/${attributeKey}`;
    attributes.push({
      path: attributePath,
      attribute: driver.attributes[attributeKey],
    });
  }

  // Collect attributes from classes within the driver
  for (const classKey in driver.classes) {
    const classPath = `${driverKey}/${classKey}`;
    collectAttributesFromClass(driver.classes[classKey], classPath, attributes);
  }
};

// Main function to collect all attributes in the Structure with their paths
const collectAllAttributesWithPath = (structure: Structure): AttributeWithPath[] => {
  const allAttributesWithPath: AttributeWithPath[] = [];

  // Traverse each driver in the structure and collect attributes
  for (const driverKey in structure.driver_instances) {
    const driver = structure.driver_instances[driverKey];
    collectAttributesFromDriver(driver, driverKey, allAttributesWithPath);
  }

  return allAttributesWithPath;
};

    function get_attribute_string(attribute: AttributeWithPath): JSX.Element {
        let name = attribute.path;
        let type = attribute.attribute.type;

        return (
            <div>
                <p>Name: {name}</p>
                <p>Type: string</p>
                <p>Value: "value"</p>
            </div>
        );
    } 

    function get_attribute_si(attribute: AttributeWithPath): JSX.Element {
        let name = attribute.path;
        let type = attribute.attribute.type;
        let unit = "V";

        return (
            <div>
                <p>Name: {name}</p>
                <p>Type: SI</p>
                <p>Value: "Value" {unit}</p>
            </div>
        );
    }

  const renderItems = (structure: Structure) => {
        let attributes:  AttributeWithPath[] = [];
        let widgets: JSX.Element[] = [];

        attributes = collectAllAttributesWithPath(structure);

        for (let attribute of attributes) {
            if (attribute.attribute.type == "string") {
                widgets.push(
                  <AttributeString attribute={attribute}/>
                );
            }
            else if (attribute.attribute.type == "si") {
              widgets.push(
                <AttributeSI attribute={attribute} />
              )
            }
        }

        return (
            widgets
        );
  }

  return (
    <div className="text-white bg-gray-800 flex flex-col flex-grow overflow-auto">
        <div className="flex-col space-y-9">
            {lol ? renderItems(lol) : <p>Not connected</p>}
        </div>
    </div>
  );
};

export default Tree;
