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
  Shield,
  FileText,
  NotebookText,
  HeartPulse,
  Computer,
  List,
  Shell,
  DollarSign,
  MapPin,
  Handshake,
  Building,
  Package,
  Building2,
} from "lucide-react";
import CompanySwitcher from "@/Components/CompanySwitcher";
import BranchSwitcher from "@/Components/BranchSwitcher";
import ContextSelectorModal from "@/Components/ContextSelectorModal";

function Side({ sidebarOpen, setSidebarOpen, userIsSuperAdmin }) {
  const { props } = usePage();
  const { current_company, current_branch } = props;
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  // Trae la URL actual para reaccionar a cambios de ruta
  const { url } = usePage();

  // Define tus items con los IDs como NOMBRES DE RUTA de Ziggy
  const menuItems = useMemo(
    () => [
      { id: "/", label: "Dashboard", icon: Home },
      {
        id: "clinical_management",
        label: "Gestión Clínica",
        icon: Stethoscope,
        submenu: [
          { id: "patients.index", label: "Pacientes", icon: Users },
          { id: "doctors.index", label: "Kines", icon: Stethoscope },
          { id: "attendances.index", label: "Atenciones", icon: List },
          { id: "session-types.index", label: "Tipos de Sesión", icon: Shell },
        ],
      },
      {
        id: "finance_admin",
        label: "Administración",
        icon: Building,
        submenu: [
          { id: "agreements.index", label: "Convenios", icon: Handshake },
          { id: "insurances.index", label: "Aseguradoras", icon: Shield },
          { id: "payrolls.index", label: "Liquidaciones", icon: NotebookText },
          { id: "finance.receivables.index", label: "Cuentas por Cobrar", icon: DollarSign },
          { id: "acquisitions.purchase-orders.index", label: "Adquisiciones", icon: Package },
          { id: "payments.index", label: "Caja / POS", icon: DollarSign },
          { id: "documents", label: "Boleta SII", icon: FileText },
        ],
      },
      {
        id: "system_config",
        label: "Configuración",
        icon: Computer,
        submenu: [
          { id: "companies.index", label: "Compañias", icon: Building },
          { id: "products.index", label: "Productos", icon: Package },
          { id: "subscription.index", label: "Mi Suscripción", icon: Shield },
        ],
      }
    ],
    []
  );

  const bottomMenuItems = useMemo(
    () => [
      /*  { id: "configuracion", label: "Configuración", icon: Settings }, */
      /* { id: "ayuda", label: "Ayuda", icon: HelpCircle }, */
    ],
    []
  );
  // Ejemplo de función de ayuda isRouteActive (usando Ziggy/Laravel)
  const isRouteActive = (routeId) => {
    // Usa comodines (*) para activar cualquier ruta que comience con el ID
    return route().current(routeId + "*");
  };

  // 🎯 FUNCIÓN CLAVE: Determina si el ÍTEM CONTENEDOR debe estar ACTIVO
  const isItemActive = (item) => {
    // 1. Verificar si el ítem principal tiene una ruta propia activa (ej: 'admin.dashboard')
    if (item.id && route().current(item.id)) {
      return true;
    }

    // 2. Verificar si el ítem tiene submenú y si ALGUNA de sus sub-rutas está activa
    if (item.submenu?.length) {
      return item.submenu.some((sub) => isRouteActive(sub.id));
    }

    return false;
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
    <div className="sticky top-0 z-40 flex flex-col bg-white border-r border-gray-100 shadow-2xl h-dvh shadow-gray-500/5">
      {/* Header del sidebar */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-50">
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex items-center justify-center w-10 h-10 shadow-lg bg-brand-primary rounded-xl shadow-brand-primary/20 shrink-0">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-black text-gray-900 uppercase text-[11px] tracking-tight truncate leading-none mb-1">
                  {current_company?.business_name || "Senex Gestion"}
                </h1>
                <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest leading-none">
                  Enterprise
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 transition-all hover:bg-gray-50 rounded-xl text-brand-gray hover:text-brand-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex justify-center w-full p-2 transition-all rounded-xl hover:bg-gray-50 text-brand-gray"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          {/* BOTÓN DE CONTEXTO (Enterprise Style) */}
          <button
            onClick={() => setIsContextModalOpen(true)}
            className={`w-full group flex items-center transition-all duration-300 rounded-[1.5rem] p-1.5 border-2 ${
              sidebarOpen
                ? "bg-gray-50 border-gray-100 hover:border-brand-primary/30 hover:bg-white hover:shadow-lg hover:shadow-brand-primary/5"
                : "bg-white border-transparent hover:border-brand-primary/20"
            }`}
          >
            <div
              className={`shrink-0 flex items-center justify-center bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20 transition-all duration-500 ${
                sidebarOpen ? "w-12 h-12" : "w-12 h-12 mx-auto"
              }`}
            >
              <Building2 className="w-6 h-6" />
            </div>

            {sidebarOpen && (
              <div className="ml-4 overflow-hidden text-left">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest truncate">
                  {current_company?.business_name || "Seleccionar..."}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-brand-gray" />
                  <span className="text-[9px] font-bold text-brand-gray uppercase truncate tracking-tight">
                    {current_branch?.name || "Sin Sucursal"}
                  </span>
                </div>
              </div>
            )}
          </button>
        </div>

        <div className="space-y-1.5">
          <p
            className={`enterprise-label px-3 mb-4 opacity-50 transition-opacity duration-300 ${
              !sidebarOpen ? "opacity-0 h-0 overflow-hidden" : ""
            }`}
          >
            Menú Principal
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            const hasSubmenu = !!item.submenu?.length;
            const open = hasSubmenu
              ? openMenus[item.id] ||
                item.submenu.some((s) => isRouteActive(s.id))
              : false;

            const baseBtnClasses =
              "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group";
            const activeClasses =
              "bg-brand-primary text-white shadow-xl shadow-brand-primary/25 transform scale-[1.02]";
            const inactiveClasses =
              "text-gray-500 hover:bg-gray-50 hover:text-brand-primary hover:pl-5";

            // Si el item NO tiene ruta propia (solo contenedor), evitamos Link principal
            const isContainerOnly = hasSubmenu && !route().has(item.id);

            const MainButton = (
              <button
                type="button"
                onClick={() => {
                  if (hasSubmenu) {
                    toggleMenu(item.id);
                  }
                }}
                className={`${baseBtnClasses} ${
                  active ? activeClasses : inactiveClasses
                }`}
                title={!sidebarOpen ? item.label : ""}
              >
                <div className="flex items-center min-w-0 gap-3">
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                      active
                        ? "text-white"
                        : "text-gray-400 group-hover:text-brand-primary"
                    }`}
                  />
                  {sidebarOpen && (
                    <span
                      className={`text-[11px] font-black uppercase tracking-widest truncate ${
                        active ? "text-white" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <div className="flex items-center gap-2">
                    {item.badge && !active && (
                      <span className="text-[9px] px-2 py-0.5 rounded-lg font-black bg-brand-secondary/10 text-brand-primary uppercase tracking-tighter">
                        {item.badge}
                      </span>
                    )}
                    {hasSubmenu && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-300 ${
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
                  MainButton
                ) : (
                  MainButton
                )}

                {/* Submenu */}
                {hasSubmenu && sidebarOpen && open && (
                  <div className="pl-4 mt-2 ml-6 space-y-1 duration-300 border-l-2 border-gray-50 animate-in slide-in-from-left-2">
                    {item.submenu.map((sub) => {
                      const SubIcon = sub.icon;
                      const subActive = isRouteActive(sub.id);
                      return route().has(sub.id) ? (
                        <Link key={sub.id} href={route(sub.id)}>
                          <div
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                              subActive
                                ? "text-brand-primary font-black"
                                : "text-gray-400 hover:text-brand-primary"
                            }`}
                          >
                            <SubIcon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {sub.label}
                            </span>
                          </div>
                        </Link>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Menú inferior */}
      <div className="p-4 border-t border-gray-50">
        <div className="p-4 bg-gray-50/50 rounded-3xl">
          <p className="text-[9px] font-black text-brand-gray text-center uppercase tracking-[0.2em] opacity-40">
            SysMed v1.0
          </p>
        </div>
      </div>

      <ContextSelectorModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
      />
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
