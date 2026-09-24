// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
  {
    // Los repositorios en memoria tienen metodos `async` sin `await`, y
    // esta bien: la interfaz promete devolver Promise porque el contrato
    // se disena para el caso mas lento (MySQL), no para el arreglo de
    // hoy. Los repositorios de Prisma si van a llevar await en cada
    // metodo. Fuera de infra/ la regla sigue encendida, que ahi si
    // ayuda a cachar un async olvidado.
    files: ['src/**/infra/*.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
);
