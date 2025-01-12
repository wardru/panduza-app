import { useDroppable, useDndMonitor } from '@dnd-kit/core';

import { v4 as uuidv4 } from 'uuid';

import {
    ReactFlow,
    ReactFlowProvider,
    Controls,
    MiniMap,
    SelectionMode,
    Background,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCallback, useState, useEffect } from 'react';
import { Node, applyNodeChanges, OnNodesChange } from '@xyflow/react';

import { usePlatform } from '../platform';

import BooleanToggleNode from './Nodes/BooleanToggle';
import SiSpinnerNode from './Nodes/SiSpinner';
import NumberSpinnerNode from './Nodes/NumberSpinner';
import SiDisplay from './Nodes/SiDisplay';
import NumberDisplay from './Nodes/NumberDisplay';
import StringInput from './Nodes/StringInput';
import StringDisplay from './Nodes/StringDisplay';
import EnumInput from './Nodes/EnumInput';

const nodeTypes = {
    booleantoggle: BooleanToggleNode,
    sispinner: SiSpinnerNode,
    sispinner_ro: SiDisplay,
    numberspinner: NumberSpinnerNode,
    numberspinner_ro: NumberDisplay,
    stringinput: StringInput,
    stringinput_ro: StringDisplay,
    enuminput: EnumInput,
    enuminput_ro: StringDisplay,
};
const proOptions = { hideAttribution: true };

const ControlView: React.FC = () => {
    const { active, setNodeRef, isOver } = useDroppable({
        id: 'controlview',
    });
    const [nodes, setNodes] = useState<Node[]>([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const flow = useReactFlow();
    const platform = usePlatform();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        document.addEventListener('mousemove', handleMouseMove);

        // Cleanup on component unmount
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []); // Empty dependency array ensures this runs only once

    useDndMonitor({
        onDragEnd() {
            if (isOver) {
                //TODO: probably want to check if dragged is an attribute or else, for tags etc..

                const att = platform.attributes?.[active?.id as string];
                if (!att) {
                    console.error(`attribute ${active?.id} not found`);
                    return;
                }

                const nodeTypeFactory: Record<string, string> = {
                    ['boolean']: 'booleantoggle',
                    ['si']: 'sispinner',
                    ['number']: 'numberspinner',
                    ['string']: 'stringinput',
                    ['enum']: 'enuminput',
                };
                let type = nodeTypeFactory[att.type];

                // TODO: Impprove the usage of attribute modes{RO, RW, W} to the creation of the nodes
                if (
                    (att.type === 'si' || att.type === 'number' || att.type === 'string' || att.type === 'enum') &&
                    att.mode === 'RO'
                ) {
                    type = type + '_ro';
                }

                if (!type) {
                    console.error(`Type ${att.type} not supported by control view`);
                    return;
                }

                const position = flow.screenToFlowPosition({
                    x: mousePosition.x,
                    y: mousePosition.y,
                });
                setNodes([
                    {
                        id: uuidv4(),
                        type,
                        position: { x: position.x, y: position.y },
                        data: { attribute: att },
                    },
                    ...nodes,
                ]);
            }
        },
    });

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    return (
        <div
            className='w-full h-full bg-neutral-900 relative'
            ref={setNodeRef}
        >
            <ReactFlow
                proOptions={proOptions}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                nodes={nodes}
                deleteKeyCode={['Backspace', 'Delete']}
                selectionKeyCode={''}
                panOnDrag={[2]}
                selectionOnDrag={true}
                selectionMode={SelectionMode.Partial}
            >
                <Background />
                <Controls />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                />
            </ReactFlow>
        </div>
    );
};

const ControlPanel = () => (
    <ReactFlowProvider>
        <ControlView />
    </ReactFlowProvider>
);

export default ControlPanel;
