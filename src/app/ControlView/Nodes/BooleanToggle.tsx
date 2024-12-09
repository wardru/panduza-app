import { useEffect, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import AttributeContainer from './AttributeContainer';
import { AttributeBool } from '@/app/attribute';

export type BooleanToggleNode = Node<{
    attribute: AttributeBool;
}>;

const BooleanToggleNode: React.FC<NodeProps<BooleanToggleNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);

    useEffect(() => {
        if (props.data.attribute.mode !== 'WO') {
            const updateValue = () => setValue(props.data.attribute.value);

            props.data.attribute.subscribe(updateValue);

            return () => {
                props.data.attribute.unsubscribe(updateValue);
            };
        }
    }, [props.data.attribute]);

    const handOnChange = () => {
        if (props.data.attribute.mode === 'WO') {
            setValue(!value); // The WO, has no receiving topic to update the value that was clicked so we update it based on widget command
        }
        props.data.attribute.publish(!value);
    };

    return (
        <AttributeContainer attribute={props.data.attribute}>
            <div className='flex justify-center items-center'>
                <label className='inline-flex items-center cursor-pointer'>
                    <input
                        type='checkbox'
                        checked={value}
                        disabled={props.data.attribute.mode === 'RO'}
                        onChange={handOnChange}
                        className='sr-only peer'
                    />
                    {props.data.attribute.mode === 'RO' ? (
                        <div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
                    ) : (
                        <div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    )}
                </label>
            </div>
        </AttributeContainer>
    );
};

export default BooleanToggleNode;
