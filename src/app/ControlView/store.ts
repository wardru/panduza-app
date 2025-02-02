import { create } from 'zustand';
import { z } from 'zod';
import { StoreActions } from '@/app/store';
import { Node, Viewport } from '@xyflow/react';

const colorList = ['#683838', '#263E48', '#294F18', '#735431', '#786E38', '#387373', '#553660'];

const controlViewSchema = z.object({
    nodes: z.array(z.custom<Node>((val) => typeof val === 'object' && val !== null)),
    viewport: z.object({
        x: z.number(),
        y: z.number(),
        zoom: z.number(),
    }),
    unlocked: z.boolean(),
    nodeColors: z.record(z.string(), z.number()),
});

interface ControlViewStore extends StoreActions {
    nodes: Node[];
    viewport: Viewport;
    unlocked: boolean;
    nodeColors: Record<string, number>;
    setNodes: (nodes: Node[]) => void;
    setViewport: (viewport: Viewport) => void;
    setUnlocked: (unlocked: boolean) => void;
    getNodeColor: (key: string) => string;
}

export const useControlViewStore = create<ControlViewStore>((set, get) => ({
    nodes: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    unlocked: true,
    nodeColors: {},

    setNodes: (nodes: Node[]) => {
        set({ nodes });
    },
    setViewport: (viewport: Viewport) => {
        set({ viewport });
    },
    setUnlocked: (unlocked: boolean) => {
        set({ unlocked });
    },

    getNodeColor: (key: string): string => {
        const nodeColors = get().nodeColors;

        if (key in nodeColors) {
            return colorList[nodeColors[key]];
        } else {
            const index = Object.keys(nodeColors).length % colorList.length;
            const color = colorList[index];

            set({ nodeColors: { ...nodeColors, [key]: index } });
            return color;
        }
    },

    save: () => {
        const state = get();

        return {
            nodes: state.nodes,
            viewport: state.viewport,
            unlocked: state.unlocked,
            nodeColors: state.nodeColors,
        };
    },

    load: (data: unknown) => {
        const result = controlViewSchema.safeParse(data);

        if (!result.success) {
            console.error('Failed to load control view state due to validation errors:', result.error.format());
            return;
        }

        set({
            nodes: result.data.nodes,
            viewport: result.data.viewport,
            unlocked: result.data.unlocked,
            nodeColors: result.data.nodeColors,
        });
    },
}));
