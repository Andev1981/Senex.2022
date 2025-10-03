import React, { useEffect, useMemo, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Stethoscope,
  Home,
  Users,
  Calendar,
  Clipboard,
  Activity,
  FileText,
  Receipt,
  DollarSign,
  Package,
  BarChart3,
  Settings,
  HelpCircle,
  Computer,
  List,
} from "lucide-react";

function Side({ sidebarOpen, setSidebarOpen }) {
  // Trae la URL actual para reaccionar a cambios de ruta
  const { url } = usePage();

  // Define tus items con los IDs como NOMBRES DE RUTA de Ziggy
  const menuItems = useMemo(
    () => [
      { id: "/", label: "Dashboard", icon: Home, badge: null },
      { id: "pacientes", label: "Pacientes", icon: Users, badge: "50" },
      { id: "doctors", label: "Kines", icon: Stethoscope, badge: "50" },
      { id: "boleta", label: "Boleta", icon: FileText, badge: "8" },
      { id: "agenda", label: "Agenda", icon: Calendar, badge: null },
      { id: "tratamientos", label: "Tratamientos", icon: List, badge: null },
      { id: "pos", label: "POST", icon: Computer, badge: null },
      /*{
        id: "tratamientos",
        label: "Tratamientos",
        icon: Activity,
        badge: "12",
      },
      {
        id: "documentos", // si no es una ruta real, deja como contenedor
        label: "Documentos",
        icon: FileText,
        badge: null,
        submenu: [
          {
            id: "doc-tributarios",
            label: "Documentos Tributarios",
            icon: Receipt,
          },
          {
            id: "doc-clinicos",
            label: "Documentos Clínicos",
            icon: Stethoscope,
          },
        ],
      }, */
      /* { id: "pagos", label: "pagos.index", icon: DollarSign, badge: "3" }, // ejemplo si tu ruta es pagos.index
      { id: "inventario", label: "Inventario", icon: Package, badge: null },
      { id: "reportes", label: "Reportes", icon: BarChart3, badge: null }, */
    ],
    []
  );

  const bottomMenuItems = useMemo(
    () => [
      { id: "configuracion", label: "Configuración", icon: Settings },
      { id: "ayuda", label: "Ayuda", icon: HelpCircle },
    ],
    []
  );

  // Helper: chequear si una ruta está activa con Ziggy
  const isRouteActive = (name) => {
    try {
      // Si usas nombres con comodín, puedes hacer route().current('documentos.*')
      // Aquí asumimos IDs exactos; ajusta si necesitas comodines.
      return route().current(name) || route().current(`${name}.*`);
    } catch {
      return false;
    }
  };

  // Dado un item, define si está activo (incluye hijos en caso de submenu)
  const isItemActive = (item) => {
    if (item.submenu?.length) {
      // Activo si algún hijo lo está
      return item.submenu.some((s) => isRouteActive(s.id));
    }
    // Si el item.id es un nombre de ruta real
    return isRouteActive(item.id);
  };

  // Estado de aperturas manuales de submenús por id
  const [openMenus, setOpenMenus] = useState({});
  const toggleMenu = (id) =>
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));

  // Al cambiar de URL, si un hijo está activo, forzar abierto el padre
  useEffect(() => {
    const nextOpen = {};
    for (const item of menuItems) {
      if (item.submenu?.length) {
        const anyChildActive = item.submenu.some((s) => isRouteActive(s.id));
        if (anyChildActive) nextOpen[item.id] = true;
      }
    }
    setOpenMenus((prev) => ({ ...prev, ...nextOpen }));
  }, [url, menuItems]);

  return (
    <div className="sticky top-0 z-40 flex flex-col bg-white border-r border-gray-200 h-dvh">
      {/* Header del sidebar */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">SenexSport</h1>
                <p className="text-xs text-gray-500">Gestión</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex justify-center w-full p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            const hasSubmenu = !!item.submenu?.length;
            const open = hasSubmenu
              ? openMenus[item.id] ||
                item.submenu.some((s) => isRouteActive(s.id))
              : false;

            const baseBtnClasses =
              "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all";
            const activeClasses =
              "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30";
            const inactiveClasses = "text-gray-700 hover:bg-gray-100";

            // Si el item NO tiene ruta propia (solo contenedor), evitamos Link principal
            const isContainerOnly = hasSubmenu && !route().has(item.id);

            const MainButton = (
              <button
                type="button"
                onClick={() => {
                  if (hasSubmenu) {
                    toggleMenu(item.id);
                  } else if (route().has(item.id)) {
                    // Navegación programática si quieres; aquí usamos Link abajo
                    // Innecesario si usas <Link>
                  }
                }}
                className={`${baseBtnClasses} ${
                  active ? activeClasses : inactiveClasses
                }`}
                title={!sidebarOpen ? item.label : ""}
              >
                <div className="flex items-center min-w-0 gap-3">
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      active ? "text-white" : "text-gray-500"
                    }`}
                  />
                  {sidebarOpen && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                </div>
                {sidebarOpen && (
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {hasSubmenu && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                )}
              </button>
            );

            return (
              <div key={item.id}>
                {/* Si el item tiene ruta real, envolvemos con Link; si es contenedor puro, dejamos button */}
                {route().has(item.id) && !hasSubmenu ? (
                  <Link href={route(item.id)}>{MainButton}</Link>
                ) : isContainerOnly ? (
                  MainButton
                ) : hasSubmenu ? (
                  // Si tiene submenu y también ruta (opcional), puedes decidir:
                  // - Click navega al primero del submenu
                  // - O dejar solo toggle. Aquí dejamos toggle y submenu con Links.
                  MainButton
                ) : (
                  // Fallback (si no existe la ruta)
                  MainButton
                )}

                {/* Submenu */}
                {hasSubmenu && sidebarOpen && open && (
                  <div className="mt-1 ml-4 space-y-1">
                    {item.submenu.map((sub) => {
                      const SubIcon = sub.icon;
                      const subActive = isRouteActive(sub.id);
                      return route().has(sub.id) ? (
                        <Link key={sub.id} href={route(sub.id)}>
                          <div
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              subActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <SubIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {sub.label}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <div
                          key={sub.id}
                          className="flex items-center w-full gap-3 px-3 py-2 text-gray-400 rounded-lg cursor-not-allowed"
                          title="Ruta no disponible"
                        >
                          <SubIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {sub.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Menú inferior */}
      <div className="p-3 space-y-1 border-t border-gray-200">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(item.id);
          const row = (
            <div
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title={!sidebarOpen ? item.label : ""}
            >
              <Icon className="w-5 h-5 text-gray-500" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </div>
          );
          return route().has(item.id) ? (
            <Link key={item.id} href={route(item.id)}>
              {row}
            </Link>
          ) : (
            <div key={item.id}>{row}</div>
          );
        })}
      </div>
    </div>
  );
}

export default Side;

/* <div className="h-full px-3 py-5 overflow-y-auto bg-white dark:bg-gray-800">
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
        </ul>
      </div> 
    </div>
  );
}

export default Side;

*/
