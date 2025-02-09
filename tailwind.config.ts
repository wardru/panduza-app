import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            fontFamily: {
                Lato: ['Lato', 'sans-serif'],
            },
            colors: {
                header: 'rgb(var(--color-header))',
                primary: 'rgb(var(--color-primary))',
                secondary: 'rgb(var(--color-secondary))',
            },
            keyframes: {
                spin: {
                    '100%': { transform: 'rotate(-360deg)' },
                },
            },
            animation: {
                spin: 'spin 1.2s infinite ',
            },
        },
    },
    plugins: [],
};
export default config;
