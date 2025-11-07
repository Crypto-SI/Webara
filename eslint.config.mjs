import eslintConfigNext from 'eslint-config-next';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'supabase/types/**',
      'dist/**',
    ],
  },
  ...eslintConfigNext,
];
