const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
    "./storage/framework/views/*.php",
    "./resources/views/**/*.blade.php",
    "./resources/js/**/*.jsx",
    "./resources/js/**/*.js",
  ],

  theme: {
    /*  extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors:{
                sky-600:'#0291b3',
                celeste:'#68d0ec',
                grisOscuro:'#111827',
                grisClaro:'#989898',
            },
        }, */
  },
  plugins: [require("flowbite/plugin", "flowbite-datepicker/js/Datepicker")],
};
