/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/preline/preline.js',
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    
  ],
  theme: {
    extend: {},
    fontFamily:{
      'sans':['sohne','Helvetica' ,'Neue','Helvetica', 'Arial', 'sans-serif'],
      'serif':['Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Open Sans','Helvetica Neue','sans-serif']
    },
    screens:{
      'xss': {'min': '161px', 'max': '320px'},
      // => @media (min-width: 161px and max-width: 320px) { ... }

      'xs': {'min': '321px', 'max': '390px'},
      // => @media (min-width: 321px and max-width: 640px) { ... }
      'sm': {'min': '391px', 'max': '576px'},
      // => @media (min-width: 401px and max-width: 576px) { ... }
      'md': {'min': '577px', 'max': '640px'},
      // => @media (min-width: 577px and max-width: 640px) { ... }
    },
  },
  plugins: [
    require("daisyui"),
    require('tailwindcss-react-aria-components')
   
  ],

}

