import React from "react";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";

function Side({ sidebarOpen }) {
  const styleSelected =
    "flex items-center p-2 text-base font-medium rounded-lg text-text-light dark:text-white dark:hover:bg-gray-700 group border border-primary/30 shadow border-2 border-sky-600";
  const styleNotSelected =
    "flex items-center p-2 text-base font-medium rounded-lg text-text-light dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group";

  return (
    <aside
      className={[
        "fixed top-0 left-0 z-40 w-52 h-screen transition-transform  bg-white border-r border-primary-light/30 pt-14 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700 ",
        sidebarOpen ? ` translate-x-0` : ` -translate-x-full`,
      ]}
    >
      <div className="h-full px-3 py-5 overflow-y-auto bg-white dark:bg-gray-800">
        <ul className="py-2 space-y-2 border-b border-primary-light/30 dark:border-gray-700">
          <li>
            <Link
              href={route("listado.pacientes")}
              className={
                location.pathname === "/listado-pacientes"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img
                src={"./icons/resolucion-de-problemas.gif"}
                className="w-6 h-6"
              />
              <span className="ml-1 text-sm text-primary">Pacientes(*)</span>
            </Link>
          </li>
          <li>
            <a
              href="/informes"
              className={
                location.pathname === "/informes"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img src={"./icons/controlar.gif"} className="w-6 h-6" />
              <span className="ml-1 text-sm text-primary">Informes</span>
            </a>
          </li>
        </ul>
        <ul className="py-2 space-y-2 border-b border-primary-light/30 dark:border-gray-700">
          <li>
            <a
              href="/pagos"
              className={
                location.pathname === "/pacientes.pagos"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img
                src={"./icons/devolucion-de-dinero.gif"}
                className="w-6 h-6"
              />
              <span className="ml-1 text-sm text-primary">
                Pacientes&nbsp;y&nbsp;Pagos
              </span>
            </a>
          </li>
          <li>
            <Link
              href={route("sesiones.pacientes")}
              className={
                location.pathname === "/sesiones-pacientes"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img src={"./icons/usuario.gif"} className="w-6 h-6" />
              <span className="ml-1 text-sm text-primary">
                Sesiones&nbsp;Pacientes(*)
              </span>
            </Link>
          </li>
        </ul>
        <ul className="py-2 space-y-2 border-b border-primary-light/30 dark:border-gray-700">
          <li>
            <a
              href="/kines"
              className={
                location.pathname === "/kines"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img src={"./icons/medicamento.gif"} className="w-6 h-6" />
              <span className="ml-1 text-sm text-primary">Kines</span>
            </a>
          </li>

          <li>
            <a
              href="/types"
              className={
                location.pathname === "/types"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img src={"./icons/controlar.gif"} className="w-6 h-6" />
              <span className="ml-1 text-sm text-primary">
                Tipo&nbsp;Atenciones
              </span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Side;
