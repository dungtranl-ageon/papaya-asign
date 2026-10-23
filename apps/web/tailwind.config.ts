import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        papaya: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#008080', // Deep Teal
          600: '#0D9488',
          700: '#0F766E',
        },
        coral: {
          500: '#FF6F61', // Papaya Coral Accent
          600: '#E05648',
        },
      },
    },
  },
  plugins: [],
};

export default config;
