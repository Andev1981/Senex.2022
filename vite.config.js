import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";

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
      input: ["resources/css/app.css", "resources/js/app.jsx"],
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "resources/js"),
      "@/Components": path.resolve(__dirname, "resources/js/Components"),
    },
  },
});
