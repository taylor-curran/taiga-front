/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Approximated from app/styles/_taiga-colors.scss
        'taiga-green': '#83eede',
        'taiga-green-dark': '#1dac9d',
        'taiga-green-darker': '#197a72',
        'taiga-grey': '#666',
        'taiga-grey-light': '#999',
        'taiga-grey-lighter': '#ccc',
        'taiga-bg': '#f4f4f4',
        'taiga-card': '#fff',
        'taiga-text': '#444',
        'taiga-link': '#1ea3a3',
        'taiga-red': '#e44057',
        'taiga-yellow': '#ffd13e',
      },
      fontFamily: {
        sans: ['"Open Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
