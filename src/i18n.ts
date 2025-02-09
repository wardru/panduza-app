import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import header_en from './assets/locales/en/header.json';
import about_en from './assets/locales/en/about.json';
import explorer_en from './assets/locales/en/explorer.json';

import header_fr from './assets/locales/fr/header.json';
import about_fr from './assets/locales/fr/about.json';
import explorer_fr from './assets/locales/fr/explorer.json';

i18n.use(initReactI18next).init({
    fallbackLng: 'en',

    interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
    },

    resources: {
        en: {
            header: header_en,
            about: about_en,
            explorer: explorer_en,
        },
        fr: {
            header: header_fr,
            about: about_fr,
            explorer: explorer_fr,
        },
    },
});

export default i18n;
