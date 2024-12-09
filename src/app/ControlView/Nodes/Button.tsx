import ContainerNode from './AttributeContainer';

import { Node, NodeProps } from '@xyflow/react';

import { AttributeBool } from '@/app/attribute';

export type ButtonNode = Node<{
    attribute: AttributeBool;
}>;

// TODO: Implement input type='text' for other types of attributes (e.g. AttributeString, AttributeInt, etc.)

const ButtonNode: React.FC<NodeProps<ButtonNode>> = (props) => {
    return (
        <ContainerNode attribute={props.data.attribute}>
            <div className='flex items-center'>
                <input
                    type='button'
                    className={`text-black bg-white px-2 py-1 rounded-xl flex-1 text-center`}
                    value={props.data.attribute.name}
                />
            </div>
        </ContainerNode>
    );
};

export default ButtonNode;

// const ButtonWidget = ({ content = '', ...props }) => {
//     return (
//         <WidgetContainer {...props}>
//             <div className='flex items-center'>
//                 <input
//                     type='button'
//                     className={`text-black bg-white px-2 py-1 rounded-xl flex-1 text-center`}
//                     value={content}
//                 />
//             </div>
//         </WidgetContainer>
//     );
// };
