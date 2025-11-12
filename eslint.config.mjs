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
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      '@next/next/no-page-custom-font': 'off',
    },
  },
];
