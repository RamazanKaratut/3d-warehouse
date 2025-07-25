// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    '.app/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './app/components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // SRC kullanıyorsanız bu satır hayati!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;