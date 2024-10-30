/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/preline/preline.js',
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Enable dark mode that works with OS settings
  darkMode: ['class'],
  theme: {
    extend: {
      screens: {
        'tablet': '640px',
        'desktop': '1024px',
      },
      // Add dark mode specific colors
      colors: {
        dark: {
          bg: '#1a1a1a',
          text: '#e5e5e5',
          primary: '#2563eb',
          secondary: '#4b5563',
          accent: '#f87171',
        }
      }
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


/*

Here's a quick reference for adding dark mode to common elements:

// Background colors
className="bg-white dark:bg-dark-bg"

// Text colors
className="text-gray-700 dark:text-gray-200"

// Border colors
className="border-gray-200 dark:border-gray-700"

// Hover states
className="hover:bg-gray-100 dark:hover:bg-gray-700"

*/