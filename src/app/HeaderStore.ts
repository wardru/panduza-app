import { z } from 'zod';
import { create } from 'zustand';
import { StoreActions } from '@/app/store';

const headerSchema = z.object({
    address: z.nullable(z.string()),
    port: z.nullable(z.number().min(0).max(65535)),
});

interface HeaderStore extends StoreActions {
    address: string | null;
    port: number | null;
    setAddress: (address: string | null) => void;
    setPort: (port: number | null) => void;
}

export const useHeaderStore = create<HeaderStore>((set, get) => ({
    address: 'localhost',
    port: 1883,

    setAddress: (address: string | null) => set({ address }),
    setPort: (port: number | null) => set({ port }),

    save: () => {
        const state = get();

        return {
            address: state.address,
            port: state.port,
        };
    },

    load: (data: unknown) => {
        const result = headerSchema.safeParse(data);

        if (!result.success) {
            console.error('Failed to load header state due to validation errors:', result.error.format());
            return;
        }

        set({
            address: result.data.address,
            port: result.data.port,
        });
    },
}));
