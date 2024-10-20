/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/preline/preline.js',
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'tablet': '640px',
        // => @media (min-width: 640px) { ... }
        'desktop': '1024px',
        // => @media (min-width: 1024px) { ... }
      },
    },
    fontFamily: {
      'sans': ['sohne', 'Helvetica', 'Neue', 'Helvetica', 'Arial', 'sans-serif'],
      'serif': ['Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      'onlyroboto': ['Roboto', 'sans-serif'],
    },
    screens: {
      'xss': {'min': '161px', 'max': '320px'},
      'xs': {'min': '321px', 'max': '390px'},
      'sm': {'min': '391px', 'max': '576px'},
      'md': {'min': '577px', 'max': '640px'},
      'tablet': '640px',
      'desktop': '1024px',
    },
  },
  plugins: [
    require("daisyui"),
    require('tailwindcss-react-aria-components')
  ],
}