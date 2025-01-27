import { create } from 'zustand';
import { z } from 'zod';
import { StoreActions } from '@/app/store';
import { Node, Viewport } from '@xyflow/react';

const controlViewSchema = z.object({
    nodes: z.array(z.custom<Node>((val) => typeof val === 'object' && val !== null)),
    viewport: z.object({
        x: z.number(),
        y: z.number(),
        zoom: z.number(),
    }),
    unlocked: z.boolean(),
});

interface ControlViewStore extends StoreActions {
    nodes: Node[];
    viewport: Viewport;
    unlocked: boolean;
    setNodes: (nodes: Node[]) => void;
    setViewport: (viewport: Viewport) => void;
    setUnlocked: (unlocked: boolean) => void;
}

export const useControlViewStore = create<ControlViewStore>((set, get) => ({
    nodes: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    unlocked: true,

    setNodes: (nodes: Node[]) => {
        set({ nodes });
    },
    setViewport: (viewport: Viewport) => {
        set({ viewport });
    },
    setUnlocked: (unlocked: boolean) => {
        set({ unlocked });
    },

    save: () => {
        const state = get();

        return {
            nodes: state.nodes,
            viewport: state.viewport,
            unlocked: state.unlocked,
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
        });
    },
}));
