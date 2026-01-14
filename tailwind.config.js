/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
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
      },
      boxShadow: {
        'button-press': 'inset 3px 3px 10px 0px rgba(0, 26, 49, 0.33)',
        'border-inset-strokelight': 'inset 0 0 0 1.5px #C5C5C5',
        'border-inset-secondary': 'inset 0 0 0 1.5px #2F55D9',
        'border-inset-secondary-press': 'inset 0 0 0 1.5px #2F55D9, inset 3px 3px 10px 0px rgba(0, 26, 49, 0.33)',
      },
      borderWidth: {
        '1.5': '1.5px',
      },
      borderRadius: {
        'button': '6px', // Standard button corner radius
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

