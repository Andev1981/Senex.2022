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
                location.pathname === "/listado-pacientes" ||
                location.pathname === "/"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img
                src={"/icons/resolucion-de-problemas.gif"}
                className="w-6 h-6"
              />
              <span className="ml-1 text-sm text-primary">
                Pacientes(*Nuevo)
              </span>
            </Link>
          </li>
          <li>
            <Link
              href={route("boleta")}
              className={
                location.pathname === "/boleta-crear"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img src={"/icons/libro-medico.gif"} className="w-6 h-6" />
              <span className="ml-1 text-sm text-primary">Boleta(*Nuevo)</span>
            </Link>
          </li>
          <li>
            <Link
              href={route("attendances.index")}
              className={
                location.pathname === "/attendances"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img src={"/icons/controlar.gif"} className="w-6 h-6" />
              <span className="ml-1 text-sm text-primary">Informes</span>
            </Link>
          </li>
          <li>
            <Link
              href={route("pos")}
              className={
                location.pathname === "/pos" ? styleSelected : styleNotSelected
              }
            >
              <img src={"/icons/controlar.gif"} className="w-6 h-6" />
              <span className="ml-1 text-sm text-primary">POS</span>
            </Link>
          </li>
          {/* <li>
            <Link
              href={route("attendances.index")}
              className={
                location.pathname === "/attendances"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img src={"/icons/usuario.gif"} className="w-6 h-6" />
              <span className="ml-1 text-sm text-primary">
                Sesiones&nbsp;Pacientes(*)
              </span>
            </Link>
          </li> */}
        </ul>
        {/* <ul className="py-2 space-y-2 border-b border-primary-light/30 dark:border-gray-700">
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
                src={"/icons/devolucion-de-dinero.gif"}
                className="w-6 h-6"
              />
              <span className="ml-1 text-sm text-primary">
                Pacientes&nbsp;y&nbsp;Pagos
              </span>
            </a>
          </li>
          <li>
            <Link
              href={route("apply.items")}
              className={
                location.pathname === "/apply-items"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img src={"/icons/usuario.gif"} className="w-6 h-6" />
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
              <img src={"/icons/medicamento.gif"} className="w-6 h-6" />
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
              <img src={"/icons/controlar.gif"} className="w-6 h-6" />
              <span className="ml-1 text-sm text-primary">
                Tipo&nbsp;Atenciones
              </span>
            </a>
          </li>
          <li>
            <Link
              href={route("session-types.index")}
              className={
                location.pathname === "/admin/session-types"
                  ? styleSelected
                  : styleNotSelected
              }
            >
              <img src={"/icons/controlar.gif"} className="w-6 h-6" />
              <span className="ml-1 text-sm text-primary">
                Tipo&nbsp;Sesiones (*)
              </span>
            </Link>
          </li>
        </ul> */}
      </div>
    </aside>
  );
}

export default Side;
