import tailwindcss from '@tailwindcss/vite';
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import path from "path";
import { resolve } from 'node:path';
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "localhost",
    // ESTO SOLUCIONA TU ERROR DE BLOQUEO:
    cors: {
      origin: "*", // Permite que senex2025latest.test pida recursos
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    hmr: {
      host: "localhost",
    },
  },
  plugins: [
    laravel({
                input: ['resources/css/app.css', 'resources/js/app.jsx'],
                ssr: 'resources/js/ssr.tsx',
                refresh: true,
                buildDirectory: 'build',
            }),
            react(),
            tailwindcss(),
  ],
  esbuild: {
            jsx: 'automatic',
        },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "resources/js"),
      "@/Components": path.resolve(__dirname, "resources/js/Components"),
      'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
    },
  },
});
