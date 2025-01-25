import { create } from 'zustand';

import { LazyStore } from '@tauri-apps/plugin-store';

import { useHeaderStore } from '@/app/HeaderStore';
import { useLanguageStore } from './LanguageStore';

export interface StoreActions {
    save: () => unknown;
    load: (data: unknown) => void;
}

interface StoreModule {
    store: StoreActions;
    key: string;
}

interface GlobalStore {
    modules: StoreModule[];

    save: () => Promise<void>;
    load: () => Promise<void>;
}

export const useGlobalStore = create<GlobalStore>((set, get) => ({
    modules: [
        {
            store: useHeaderStore.getState(),
            key: 'header',
        },
        {
            store: useLanguageStore.getState(),
            key: 'language',
        },
    ],

    save: async () => {
        const store = new LazyStore('settings.json', { autoSave: false });
        const state = get();

        await Promise.all(state.modules.map(async (module) => await store.set(module.key, module.store.save())));
        await store.save();
    },

    load: async () => {
        const store = new LazyStore('settings.json', { autoSave: false });
        const state = get();

        await Promise.all(
            state.modules.map(async (module) => {
                const data: Record<string, unknown> | undefined = await store.get(module.key);

                if (data) {
                    module.store.load(data);
                }
            })
        );
    },
}));
