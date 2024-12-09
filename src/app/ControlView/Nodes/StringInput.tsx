import { useEffect, useState } from 'react';

import { Node, NodeProps } from '@xyflow/react';

import ContainerNode from './AttributeContainer';
import { AttributeString } from '@/app/attribute';

export type StringInputNode = Node<{
    attribute: AttributeString;
}>;

const StringInputNode: React.FC<NodeProps<StringInputNode>> = (props) => {
    const [value, setValue] = useState(props.data.attribute.value);
    //     const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const updateValue = () => setValue(props.data.attribute.value);

        props.data.attribute.subscribe(updateValue);

        return () => {
            props.data.attribute.unsubscribe(updateValue);
        };
    }, [props.data.attribute]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            console.log(event.currentTarget.value);
            event.currentTarget.blur();
        }
    };

    const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.relatedTarget === event.target) {
            return;
        }

        const str = event.currentTarget.value;

        if (str === '') {
            return;
        }

        props.data.attribute.publish(event.currentTarget.value);
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;

        setValue(newValue);
    };

    return (
        <ContainerNode attribute={props.data.attribute}>
            <div className='flex items-center'>
                <input
                    className={`text-black bg-white px-2 py-1 rounded-md flex-1 text-center nodrag`}
                    type='text'
                    value={value}
                    placeholder='Enter string'
                    onBlur={handleOnBlur}
                    onKeyDown={handleKeyDown}
                    onChange={handleOnChange}
                />
            </div>
        </ContainerNode>
    );
};

export default StringInputNode;
