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
      'sans':['sohne','Helvetica' ,'Neue','Helvetica', 'Arial', 'sans-serif']
    },
  },
  plugins: [
    require("daisyui"),
    require("@material-tailwind/react/utils/withMT")
  ],

}

