 /** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{html,js}"],
   theme: {
     extend: {
      colors: {
        'mainGray' : '#282B30',
        'darkGray' : '#1E2124',
        'lightGray' : '#36393E',
        'extraLightGray' : '#424549',
        'myBlue' : '#7289DA',
        'myWhite' : '#ffffff',
        'darkBlue': '#0F172A',
        'dullBlue': '#1E293B',
        'brightBlue': '#33ACE4',
        'darkerBlue': "#151E2C"
      }
     },
   },
   plugins: [],
 }