import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
      backgroundColor: ["disabled"],
    },
  },
  plugins: [
    laravel({
      input: [
        "resources/css/app.css",
        "resources/js/app.jsx",
        "resources/js/app.js",
      ],
      refresh: true,
    }),
    react(),
  ],
});
