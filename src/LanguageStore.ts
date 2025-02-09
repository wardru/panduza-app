import { z } from 'zod';
import { create } from 'zustand';
import { StoreActions } from './store';
import i18next from 'i18next';

const languages = ['en', 'fr'] as const;
const languageSchema = z.enum(languages);

interface LanguageStore extends StoreActions {
    language: string;
    setLanguage: (language: string) => void;
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
    language: languages[0],

    setLanguage: (language: string) => {
        i18next.changeLanguage(language);
        set({ language });
    },

    save: () => get().language,

    load: (data: unknown) => {
        const result = languageSchema.safeParse(data);

        if (!result.success) {
            console.error('Failed to load language state due to validation errors:', result.error.format());
            return;
        }

        get().setLanguage(result.data);
    },
}));
