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
    extend: {
      colors: {
        brand: {
          primary: "#3292b3",
          secondary: "#79d0ec",
          gray: "#858793",
        },
      },
      borderRadius: {
        'enterprise': '2rem',
        'enterprise-xl': '2.5rem',
        'enterprise-sm': '1.25rem',
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "table-py": "0.625rem", // py-2.5 estándar
      },
    },
  },
  plugins: [require("flowbite/plugin", "flowbite-datepicker/js/Datepicker")],
};
