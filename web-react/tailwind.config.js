/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        taiga: {
          50: '#f3f9f6',
          100: '#dff0e6',
          200: '#bfe0cd',
          300: '#94c9ad',
          400: '#62a982',
          500: '#3e8b62',
          600: '#2c6f4c',
          700: '#23593c',
          800: '#1c4731',
          900: '#143a27',
        },
        accent: {
          50: '#fff8eb',
          100: '#feebc7',
          200: '#fcd587',
          300: '#fab84a',
          400: '#f8a31f',
          500: '#e9890f',
          600: '#cc6c0a',
          700: '#a3500c',
          800: '#864010',
          900: '#723612',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
