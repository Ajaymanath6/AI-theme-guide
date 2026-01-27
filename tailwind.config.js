/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      screens: {
        'c_md': '768px',
        'c_xl': '1280px',
      },
      fontFamily: {
        'sans': ['IBM Plex Sans', 'sans-serif'],
        'lora': ['Lora', 'serif'],
      },
      colors: {
        'brandcolor-primary': '#008B31',
        'brandcolor-primaryhover': '#016323',
        'brandcolor-secondary': '#2F55D9',
        'brandcolor-secondaryhover': '#183885',
        'brandcolor-neutralhover': '#EFEFEF',
        'brandcolor-textstrong': '#001A31',
        'brandcolor-textweak': '#5C6166',
        'brandcolor-strokestrong': '#737373',
        'brandcolor-strokeweak': '#DDDDDD',
        'brandcolor-strokemild': '#A5A5A5',
        'brandcolor-strokelight': '#C5C5C5',
        'brandcolor-fill': '#F5F5F5',
        'brandcolor-white': '#FFFFFF',
        'brandcolor-sidebarhover': '#2E3C48',
        'brandcolor-banner-info-bg': '#D5DFFF',
        'brandcolor-banner-warning-bg': '#FFEBE1',
        'brandcolor-banner-warning-button': '#F26333',
        'brandcolor-results-bg': '#F8F9FB',
      },
      boxShadow: {
        'button-press': 'inset 3px 3px 10px 0px rgba(0, 26, 49, 0.33)',
        'border-inset-strokelight': 'inset 0 0 0 1.5px #C5C5C5',
        'border-inset-secondary': 'inset 0 0 0 1.5px #2F55D9',
        'border-inset-secondary-press': 'inset 0 0 0 1.5px #2F55D9, inset 3px 3px 10px 0px rgba(0, 26, 49, 0.33)',
        'header': '0px 4px 4px 0px rgba(115, 115, 115, 0.05)',
        'tab-option': '0 1px 5px 0 rgba(0, 0, 0, 0.2)',
      },
      borderWidth: {
        '1.5': '1.5px',
      },
      borderRadius: {
        'button': '6px', // Standard button corner radius
        'large': '12px', // Large corner radius
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

