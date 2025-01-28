import { useDroppable, useDndMonitor } from '@dnd-kit/core';

import { v4 as uuidv4 } from 'uuid';

import { IClass } from '../structure';
import { useUndoRedo } from './UndoRedo';

import {
    ReactFlow,
    ReactFlowProvider,
    Controls,
    MiniMap,
    SelectionMode,
    Background,
    useReactFlow,
    OnNodesDelete,
    OnNodeDrag,
    SelectionDragHandler,
    Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../../styles/globals.css';

import { useCallback, useEffect, useRef } from 'react';
import { applyNodeChanges, OnNodesChange } from '@xyflow/react';

import { usePlatform } from '../platform';

import BooleanToggleNode from './Nodes/BooleanToggle';
import BooleanButtonsNode from './Nodes/BooleanButtons';
import SiSpinnerNode from './Nodes/SiSpinner';
import NumberSpinnerNode from './Nodes/NumberSpinner';
import SiDisplay from './Nodes/SiDisplay';
import NumberDisplay from './Nodes/NumberDisplay';
import StringInput from './Nodes/StringInput';
import StringDisplay from './Nodes/StringDisplay';
import EnumInput from './Nodes/EnumInput';
import EnumDisplay from './Nodes/EnumDisplay';
import ReplNode from './Nodes/Repl';
import FileUploader from './Nodes/FileUploader';
import { useControlViewStore } from './store';

const nodeTypes = {
    booleantoggle: BooleanToggleNode,
    booleanbuttons: BooleanButtonsNode,
    sispinner: SiSpinnerNode,
    sispinner_ro: SiDisplay,
    numberspinner: NumberSpinnerNode,
    numberspinner_ro: NumberDisplay,
    stringinput: StringInput,
    stringinput_ro: StringDisplay,
    enuminput: EnumInput,
    enuminput_ro: EnumDisplay,
    repl: ReplNode,
    fileuploader: FileUploader,
};
const proOptions = { hideAttribution: true };

const ControlView: React.FC = () => {
    const { active, setNodeRef, isOver } = useDroppable({
        id: 'controlview',
    });

    const nodes = useControlViewStore((state) => state.nodes);
    const setNodes = useControlViewStore((state) => state.setNodes);
    const viewport = useControlViewStore((state) => state.viewport);
    const setViewport = useControlViewStore((state) => state.setViewport);
    const unlocked = useControlViewStore((state) => state.unlocked);
    const setUnlocked = useControlViewStore((state) => state.setUnlocked);

    const mousePosition = useRef({ x: 0, y: 0 });
    const { takeSnapshot } = useUndoRedo();

    const flow = useReactFlow();
    const platform = usePlatform();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePosition.current = { x: e.clientX, y: e.clientY };
        };

        document.addEventListener('mousemove', handleMouseMove);
        // Cleanup on component unmount
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []); // Empty dependency array ensures this runs only once

    const createAttributeNode = (attributePath: string, customPosition?: { x: number; y: number }): boolean => {
        const att = platform.attributes?.[attributePath];
        if (!att) {
            console.error(`attribute ${attributePath} not found`);
            return false;
        }

        const nodeTypeFactory: Record<string, string> = {
            ['boolean']: 'booleantoggle',
            ['si']: 'sispinner',
            ['number']: 'numberspinner',
            ['string']: 'stringinput',
            ['enum']: 'enuminput',
            ['json']: 'fileuploader',
        };
        let type = nodeTypeFactory[att.type];
        if (!type) {
            console.error(`Attribute type ${att.type} not supported by control view`);
            return false;
        }
        if (['si', 'number', 'string', 'enum'].includes(att.type) && att.mode === 'RO') {
            type = type + '_ro';
        } else if (att.type == 'boolean' && att.mode == 'WO') {
            type = 'booleanbuttons';
        }

        const position =
            customPosition ||
            flow.screenToFlowPosition({
                x: mousePosition.current.x,
                y: mousePosition.current.y,
            });

        flow.getNodes().map((node) => {
            flow.updateNode(node.id, { selected: false });
        });

        flow.addNodes([
            {
                id: uuidv4(),
                type,
                position,
                selected: unlocked,
                data: {
                    attribute: {
                        path: att.path,
                        name: att.name,
                        mode: att.mode,
                        classPath: att.classPath,
                        driver: att.parentDriver,
                    },
                },
            },
        ]);

        return true;
    };

    const createClassNode = (
        path: string,
        customPosition?: { x: number; y: number }
    ): { x: number; y: number } | undefined => {
        const iclass = platform.getClassData(path);

        if (!iclass) {
            console.error(`class ${path} not found`);
            return;
        }

        //TODO: taking the first tag for now, need to implement tag selection in a context menu probably

        if (iclass.tags.length === 0) {
            const position =
                customPosition ||
                flow.screenToFlowPosition({
                    x: mousePosition.current.x,
                    y: mousePosition.current.y,
                });

            const instantiateAttributesInClass = (
                classPath: string,
                iclass: IClass,
                position: { x: number; y: number }
            ) => {
                for (const childClass in iclass.classes) {
                    classPath = classPath + '/' + childClass;
                    instantiateAttributesInClass(classPath, iclass.classes[childClass], position);
                }
                for (const attribute in iclass.attributes) {
                    const attributePath = classPath + '/' + attribute;

                    const newPosition = {
                        x: position.x,
                        y: position.y,
                    };

                    if (createAttributeNode(attributePath, newPosition)) {
                        position.x += 40;
                        position.y += 40;
                    }
                }
            };

            instantiateAttributesInClass(path, iclass, position);
            return position;
        }

        const tag = iclass.tags[0];

        const nodeTypeFactory: Record<string, string> = {
            ['REPL']: 'repl',
        };

        const nodeType = nodeTypeFactory[tag];

        if (!nodeType) {
            console.error(`Class tag ${tag} not supported by control view`);
            return;
        }

        let data = {};

        if (tag === 'REPL') {
            const commandAttribute = platform.attributes?.[path + '/command'];
            if (!commandAttribute) {
                console.error(`REPL class does not have a command attribute`);
                return;
            }
            const responseAttribute = platform.attributes?.[path + '/response'];
            if (!responseAttribute) {
                console.error(`REPL class does not have a response attribute`);
                return;
            }

            data = {
                attributeCommand: {
                    path: commandAttribute.path,
                    name: commandAttribute.name,
                    mode: commandAttribute.mode,
                    classPath: commandAttribute.classPath,
                    driver: commandAttribute.parentDriver,
                },
                attributeResponse: {
                    path: responseAttribute.path,
                    name: responseAttribute.name,
                    mode: responseAttribute.mode,
                    classPath: responseAttribute.classPath,
                    driver: responseAttribute.parentDriver,
                },
            };
        }

        const position = flow.screenToFlowPosition({
            x: mousePosition.current.x,
            y: mousePosition.current.y,
        });

        flow.addNodes([
            {
                id: uuidv4(),
                type: nodeType,
                selected: unlocked,
                position: { x: position.x, y: position.y },
                data,
            },
        ]);
    };

    const createDriverNode = (path: string) => {
        const driver = platform.structure?.drivers[path];

        if (!driver) {
            console.error(`error. driver ${driver} not found`);
            return;
        }

        let position = flow.screenToFlowPosition({
            x: mousePosition.current.x,
            y: mousePosition.current.y,
        });

        for (const iclass in driver.classes) {
            position = createClassNode(path + '/' + iclass, position) || position;
        }
    };

    useDndMonitor({
        onDragEnd() {
            if (isOver) {
                const path = active?.data?.current?.path;
                const type = active?.data?.current?.type;

                if (type === 'attribute') {
                    createAttributeNode(path);
                } else if (type === 'class') {
                    createClassNode(path);
                } else if (type === 'driver') {
                    createDriverNode(path);
                }
                takeSnapshot();
            }
        },
    });

    const onViewportChange = (viewport: Viewport) => {
        setViewport(viewport);
    };

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes(applyNodeChanges(changes, nodes)),
        [setNodes, nodes]
    );

    const onNodesDelete: OnNodesDelete = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    const onNodeDragStart: OnNodeDrag = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    return (
        <div
            className='w-full h-full bg-neutral-900 relative'
            ref={setNodeRef}
            onContextMenu={(e) => e.preventDefault()}
        >
            <ReactFlow
                viewport={viewport}
                onViewportChange={onViewportChange}
                nodes={nodes}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                onNodesChange={onNodesChange}
                onNodesDelete={onNodesDelete}
                onNodeDragStart={onNodeDragStart}
                onSelectionDragStart={onSelectionDragStart}
                deleteKeyCode={['Backspace', 'Delete']}
                elevateNodesOnSelect
                selectionKeyCode={''}
                selectionOnDrag
                selectionMode={SelectionMode.Partial}
                panOnDrag={[1]}
                //
                //TODO: move this to user preference settings

                // Figma Style
                // panOnScroll={true}
                // zoomOnScroll={false}

                //Blender Style
                panOnScroll={false}
                zoomOnScroll
                //
                zoomOnDoubleClick={false}
                className={` border ${unlocked ? 'border-transparent' : ' border-lime-500'} `}
            >
                {unlocked ? <Background /> : null}
                <Controls
                    onInteractiveChange={(status) => {
                        setUnlocked(status);

                        // disable nodes when lock
                        if (status == false) {
                            flow.getNodes().map((node) => {
                                flow.updateNode(node.id, { selected: false });
                            });
                        }
                    }}
                />
                {unlocked ? (
                    <MiniMap
                        nodeStrokeWidth={3}
                        zoomable
                        pannable
                    />
                ) : null}
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
