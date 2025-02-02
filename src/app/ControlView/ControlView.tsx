import { useCallback, useState, useEffect, useRef } from 'react';

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
    OnNodesDelete,
    OnNodeDrag,
    SelectionDragHandler,
    Viewport,
    XYPosition,
    applyNodeChanges,
    OnNodesChange,
    NodeChange,
    Node,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import '../../styles/globals.css';

import { usePlatform } from '../platform';
import { IClass } from '../structure';
import { useUndoRedo } from './UndoRedo';
import { useCopyPasteCut } from './CopyPasteCut';
import { useControlViewStore } from './store';
import { useHelperLines } from './UseHelperLines';

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
import HelperLines from './HelperLines';

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
    const nodes = useControlViewStore((state) => state.nodes);
    const setNodes = useControlViewStore((state) => state.setNodes);
    const viewport = useControlViewStore((state) => state.viewport);
    const setViewport = useControlViewStore((state) => state.setViewport);
    const unlocked = useControlViewStore((state) => state.unlocked);
    const setUnlocked = useControlViewStore((state) => state.setUnlocked);

    const { active, setNodeRef, isOver } = useDroppable({ id: 'controlview' });
    const { undo, redo, takeSnapshot } = useUndoRedo();
    const { copy, paste, cut, selectAll, unselectAll, setControlsLock } = useCopyPasteCut();
    const { getHelperLines } = useHelperLines();
    const [helperLineHorizontal, setHelperLineHorizontal] = useState<number | undefined>(undefined);
    const [helperLineVertical, setHelperLineVertical] = useState<number | undefined>(undefined);

    const flow = useReactFlow();
    const platform = usePlatform();
    const mousePosition = useRef<XYPosition>({ x: 0, y: 0 });
    const ctrlViewRef = useRef<HTMLDivElement | null>(null);

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

        unselectAll();

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
                unselectAll();
                if (type === 'attribute') {
                    createAttributeNode(path);
                } else if (type === 'class') {
                    createClassNode(path);
                } else if (type === 'driver') {
                    createDriverNode(path);
                }
                takeSnapshot();
                ctrlViewRef.current?.focus();
            }
        },
    });

    const customApplyNodeChanges = useCallback(
        (changes: NodeChange[], nodes: Node[]): Node[] => {
            // reset the helper lines (clear existing lines, if any)
            setHelperLineHorizontal(undefined);
            setHelperLineVertical(undefined);

            // this will be true if it's a single node being dragged
            // inside we calculate the helper lines and snap position for the position where the node is being moved to
            if (
                (changes.length === 1 || nodes.filter((node) => node.selected).length === 1) &&
                changes[0].type === 'position' &&
                changes[0].dragging &&
                changes[0].position
            ) {
                const helperLines = getHelperLines(changes[0], nodes);

                // if we have a helper line, we snap the node to the helper line position
                // this is being done by manipulating the node position inside the change object
                changes[0].position.x = helperLines.snapPosition.x ?? changes[0].position.x;
                changes[0].position.y = helperLines.snapPosition.y ?? changes[0].position.y;

                // if helper lines are returned, we set them so that they can be displayed
                setHelperLineHorizontal(helperLines.horizontal);
                setHelperLineVertical(helperLines.vertical);
            }

            return applyNodeChanges(changes, nodes);
        },
        [getHelperLines]
    );

    // Combine setNodeRef with storing the element in elementRef
    const handleRef = (element: HTMLDivElement | null) => {
        setNodeRef(element); // Assign to dnd-kit
        ctrlViewRef.current = element; // Store in useRef
    };

    const onViewportChange = (viewport: Viewport) => {
        setViewport(viewport);
    };

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            setNodes(customApplyNodeChanges(changes, nodes));
        },
        [nodes, setNodes, customApplyNodeChanges]
    );

    const onNodesDelete: OnNodesDelete = useCallback(() => {
        takeSnapshot();
        ctrlViewRef.current?.focus();
    }, [takeSnapshot]);

    const onNodeDragStart: OnNodeDrag = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'c' && (event.ctrlKey || event.metaKey)) {
            // copy
            copy();
            console.log('Copy');
        } else if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
            // paste
            takeSnapshot();
            paste(mousePosition.current);
            console.log('Paste');
        } else if (event.key === 'x' && (event.ctrlKey || event.metaKey)) {
            takeSnapshot();
            cut();
            ctrlViewRef.current?.focus();
            // cut
            console.log('Cut');
        } else if (event.key === 'Z' && (event.ctrlKey || event.metaKey) && event.shiftKey) {
            // redo
            redo();
            console.log('Redo');
        } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
            // undo
            undo();
            console.log('Undo');
        } else if (event.key === 'l' && (event.ctrlKey || event.metaKey)) {
            // lock
            setUnlocked(!unlocked);
            setControlsLock(unlocked);
            console.log('Toggle Locking');
        } else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
            // select all
            if (unlocked) {
                selectAll();
                console.log('Select All');
            }
        } else if (event.key === 'escape') {
            // unselect all
            unselectAll();
            ctrlViewRef.current?.focus();
            console.log('UnSelect All');
        }
    };

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

    return (
        <ReactFlow
            className={`w-full h-full bg-neutral-900 relative border ${unlocked ? 'border-transparent' : 'border-lime-500'} `}
            ref={handleRef}
            tabIndex={0} // Makes the div focusable
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={handleKeyDown} // Attach the keyboard event handler
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
        >
            {unlocked ? <Background /> : null}
            <Controls
                onInteractiveChange={(status) => {
                    setUnlocked(status);

                    // disable nodes when lock
                    if (status == false) {
                        unselectAll();
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
            <HelperLines
                horizontal={helperLineHorizontal}
                vertical={helperLineVertical}
            />
        </ReactFlow>
    );
};

const ControlPanel = () => (
    <ReactFlowProvider>
        <ControlView />
    </ReactFlowProvider>
);

export default ControlPanel;
