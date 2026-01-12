import "../css/app.css";
// 1. IMPORTAR AXIOS
import axios from 'axios';
import { Toaster } from "sonner";
/* import "flowbite"; */
/* import { createPopper } from "@popperjs/core"; */

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";

/* window.createPopper = createPopper; */
const appName = import.meta.env.VITE_APP_NAME || "Senex";

createInertiaApp({
  title: (title) => title ? `${title} - ${appName}` : appName,
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob("./pages/**/*.tsx")
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <>
        <App {...props} />
        {/* 2. Agregamos el Toaster aquí para que sea global */}
        <Toaster
          richColors
          position="top-right"
          expand={false}
          duration={4000}
          closeButton
        />
      </>
    );
  },
  progress: {
    color: "#68d0ec",
  },
});
