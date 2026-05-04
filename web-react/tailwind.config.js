/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary palette — extracted from app/themes/taiga/variables.scss
        primary: {
          DEFAULT: '#25A28C',
          75: '#5CBAA9',
          50: '#92D1C5',
          25: '#C9E8E2',
          10: '#E9F6F3',
        },
        secondary: {
          DEFAULT: '#A7CB23',
          dark: '#91B011',
          75: '#BDD65A',
          50: '#D3E391',
          25: '#E9F1C8',
        },
        tertiary: '#C6C6D4',

        // Link / accent
        link: {
          primary: '#008AA8',
          tertiary: '#70728F',
          red: '#E44057',
          orange: '#EA7B4B',
          yellow: '#F6C95C',
          green: '#93C45D',
          purple: '#CA81BE',
        },

        // Solid accent
        'solid-primary': '#83EEDE',

        // Greyscale — mirrors $grey-02 … $grey-90
        gray: {
          100: '#F9F9FB',
          200: '#ECEFF4',
          300: '#E5E9F0',
          400: '#D8DEE9',
          500: '#A9AABC',
          600: '#8D8EA5',
          700: '#70728F',
          800: '#505C74',
        },
        black: {
          DEFAULT: '#000000',
          600: '#4C566A',
          700: '#434C5E',
          800: '#3B4252',
          900: '#2E3440',
        },

        // State / solid tints
        'solid-red': 'rgba(228,64,87,0.25)',
        'solid-orange': 'rgba(234,123,75,0.25)',
        'solid-yellow': 'rgba(246,201,92,0.25)',
        'solid-green': 'rgba(147,196,93,0.25)',
        'solid-purple': 'rgba(202,129,190,0.25)',

        // Card
        card: { DEFAULT: '#fff8e4', hover: '#f1e8cd', dark: '#cfc29b' },

        // Status / misc
        red: { DEFAULT: '#FF6363', 25: '#FFA5A5', 10: '#FFE7E7' },
        highlight: '#E5F390',

        // Legacy aliases (used by existing scaffold classes)
        'taiga-green': '#83eede',
        'taiga-green-dark': '#25A28C',
        'taiga-green-darker': '#197a72',
        'taiga-grey': '#70728F',
        'taiga-grey-light': '#8D8EA5',
        'taiga-grey-lighter': '#D8DEE9',
        'taiga-bg': '#F9F9FB',
        'taiga-card': '#fff',
        'taiga-text': '#2E3440',
        'taiga-link': '#008AA8',
        'taiga-red': '#E44057',
        'taiga-yellow': '#F6C95C',
      },

      fontFamily: {
        sans: ['Ubuntu', '"Open Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Courier New"', 'monospace'],
      },

      fontSize: {
        'xs-taiga': '0.7rem',
        'sm-taiga': '0.875rem',
        'base-taiga': '1rem',
        'lg-taiga': '1.1rem',
        'xl-taiga': '1.4rem',
        '2xl-taiga': '1.7rem',
        '3xl-taiga': '2.1rem',
        'giant': '4rem',
      },

      spacing: {
        // Common spacing from the AngularJS SCSS
        4.5: '1.125rem',
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
      },

      borderRadius: {
        taiga: '4px',
        'taiga-lg': '5px',
      },

      boxShadow: {
        taiga: '1px 1px 15px 6px rgba(0,0,0,0.1)',
        'taiga-sm': '0 1px 3px rgba(0,0,0,0.08)',
        'taiga-lg': '0 4px 20px rgba(0,0,0,0.12)',
      },

      screens: {
        mobile: '480px',
        tablet: '769px',
        desktop: '1024px',
        widescreen: '1216px',
        fullhd: '1408px',
        ultrawide: '1960px',
      },

      zIndex: {
        lightbox: '1000',
        dropdown: '900',
        toast: '1100',
      },
    },
  },
  plugins: [],
};
