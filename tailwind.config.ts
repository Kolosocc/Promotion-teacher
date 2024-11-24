import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'medium-gray': '#0d1117',
        'lite-gray': '#262c36',
        'text-gray': '#9198a1',
        'text-blue': '#4493f8',
        black: '#010409',
        white: '#f0f6fc',
        'error-color': '#f44336',
        'success-color': '#4caf50',

        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      spacing: {
        '18': '4.5rem',  
      },
      borderRadius: {
        '4xl': '2rem',  
      },
      fontSize: {
        'xxs': '.625rem',  
      },
    },
  },
  plugins: [],
} satisfies Config
