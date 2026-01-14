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
        'brandcolor-secondaryhover': '#EFEFEF',
        'brandcolor-textstrong': '#001A31',
        'brandcolor-textweak': '#5C6166',
        'brandcolor-strokestrong': '#737373',
        'brandcolor-strokeweak': '#DDDDDD',
        'brandcolor-strokemild': '#A5A5A5',
        'brandcolor-fill': '#F5F5F5',
        'brandcolor-white': '#FFFFFF',
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

