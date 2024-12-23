import { FlatCompat } from '@eslint/eslintrc';
const compat = new FlatCompat({
    // import.meta.dirname is available after Node.js v20.11.0
    baseDirectory: import.meta.dirname,
});
const eslintConfig = [
    ...compat.config({
        extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/strict', 'prettier'],
        rules: {
            '@typescript-eslint/no-inferrable-types': 'error',
        },
        ignorePatterns: ['/src-tauri', '/node_modules', '/.next', '/out'],
    }),
];
export default eslintConfig;
