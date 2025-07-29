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
        'myWhite' : '#ffffff'
      }
     },
   },
   plugins: [],
 }