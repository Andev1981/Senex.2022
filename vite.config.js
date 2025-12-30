import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from 'path';

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
      input: ["resources/css/app.css", "resources/js/app.jsx"],
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
        '@/Components': path.resolve(__dirname, 'resources/js/Components'),
    },
  },
});
