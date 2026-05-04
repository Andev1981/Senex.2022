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
  Layers,
  Clock,
  Box,
} from "lucide-react";
import CompanySwitcher from "@/components/CompanySwitcher";
import BranchSwitcher from "@/components/BranchSwitcher";
import ContextSelectorModal from "@/components/ContextSelectorModal";

import { usePermission } from "@/hooks/usePermission";

function Side({ sidebarOpen, setSidebarOpen, userIsSuperAdmin, userIsAdmin }) {
  const { props } = usePage();
  const { current_company, current_branch } = props;
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const { hasPermission } = usePermission();
  // Trae la URL actual para reaccionar a cambios de ruta
  const { url } = usePage();

  // Define tus items con los IDs como NOMBRES DE RUTA de Ziggy
  const menuItems = useMemo(
    () => {
      const businessType = current_company?.business_type || 'clinical';
      const isClinical = businessType === 'clinical';
      const isService = businessType === 'service';
      const isRetail = businessType === 'retail';

      // Módulos habilitados (Prioridad Sucursal > Empresa)
      const enabledModules = current_branch?.enabled_modules 
        || current_company?.enabled_modules 
        || ['clinical_management', 'commercial_management', 'finance_admin', 'system_config']; // Por defecto todos si es null para no romper nada actual

      const items = [
        { id: "dashboard", label: "Dashboard", icon: Home },
      ];

      // BLOQUE: GESTIÓN DE PERSONAS (Dinámico)
      if (isClinical && enabledModules.includes('clinical_management')) {
        const clinicalSubmenu = [
            { id: "agendas.index", label: "Agenda", icon: Calendar },
            { id: "availabilities.index", label: "Disponibilidad", icon: Clock },
            { id: "patients.index", label: "Pacientes", icon: Users },
            { id: "doctors.index", label: "Kines", icon: Stethoscope },
            { id: "treatment-sessions.index", label: "Atenciones", icon: List },
            { id: "products.index", label: "Catálogo", icon: Package },
            { id: "categories.index", label: "Categorías", icon: Layers },
        ].filter(item => hasPermission(item.id) || userIsSuperAdmin); // 👈 Admin debe tener el permiso

        if (clinicalSubmenu.length > 0) {
            items.push({
                id: "clinical_management",
                label: "Gestión Clínica",
                icon: Stethoscope,
                submenu: clinicalSubmenu,
            });
        }
      } else if (!isClinical && enabledModules.includes('commercial_management')) {
        // Para Service o Retail, mostramos "Gestión Comercial"
        const commercialSubmenu = [
            { id: "patients.index", label: "Clientes", icon: Users },
            { id: "products.index", label: "Catálogo", icon: Package },
            { id: "categories.index", label: "Categorías", icon: Layers },
        ].filter(item => hasPermission(item.id) || userIsSuperAdmin);

        if (commercialSubmenu.length > 0) {
            items.push({
                id: "commercial_management",
                label: isService ? "Gestión de Servicios" : "Ventas & Retail",
                icon: isService ? Computer : Package,
                submenu: commercialSubmenu,
            });
        }
      }

      // BLOQUE: FINANZAS Y CONVENIOS
      if (enabledModules.includes('finance_admin')) {
        const financeSubmenu = [];
        
        // Módulos específicos de Salud
        if (isClinical) {
            if (hasPermission("insurances.index") || userIsSuperAdmin) financeSubmenu.push({ id: "insurances.index", label: "Aseguradoras", icon: Shield });
            if (hasPermission("plans.index") || userIsSuperAdmin) financeSubmenu.push({ id: "plans.index", label: "Packs Comerciales", icon: Box });
        }

        // Módulos Comunes
        if (hasPermission("finance.receivables.index") || userIsSuperAdmin) financeSubmenu.push({ id: "finance.receivables.index", label: "Cuentas por Cobrar", icon: FileText });
        if (hasPermission("payments.index") || userIsSuperAdmin) financeSubmenu.push({ id: "payments.index", label: "Caja / POS", icon: DollarSign });
        if (hasPermission("payrolls.index") || userIsSuperAdmin) financeSubmenu.push({ id: "payrolls.index", label: isClinical ? "Liquidaciones" : "Pagos Honorarios", icon: NotebookText });

        if (financeSubmenu.length > 0) {
            items.push({
                id: "finance_management",
                label: "Finanzas y Convenios",
                icon: DollarSign,
                submenu: financeSubmenu,
            });
        }
      }

      // Solo añadir Configuración si es Superadmin o Admin
      if (userIsSuperAdmin || userIsAdmin) {
        const configSubmenu = [];
        
        if (hasPermission("admin.users-management.index")) {
            configSubmenu.push({ id: "admin.users-management.index", label: "Usuarios y Permisos", icon: Users });
        }

        if (userIsSuperAdmin) {
            configSubmenu.push({ id: "companies.index", label: "Compañias", icon: Building });
            configSubmenu.push({ id: "subscription.index", label: "Mi Suscripción", icon: Shield });
            configSubmenu.push({ id: "documents", label: "Facturación SII", icon: FileText });
        }

        if (configSubmenu.length > 0) {
            items.push({
              id: "system_config",
              label: "Configuración",
              icon: Computer,
              submenu: configSubmenu,
            });
        }
      }

      // BLOQUE: LABORATORIO (DESARROLLO) - Solo Superadmin
      if (userIsSuperAdmin) {
        items.push({
            id: "dev_lab",
            label: "Laboratorio Dev",
            icon: Shell,
            submenu: [
                { id: "acquisitions.suppliers.index", label: "Proveedores", icon: Building2 },
                { id: "acquisitions.purchase-orders.index", label: "Adquisiciones", icon: Package },
            ],
        });
      }

      return items;
    },
    [userIsSuperAdmin, userIsAdmin, current_company?.business_type, current_company?.enabled_modules, current_branch?.enabled_modules, hasPermission]
  );

  const bottomMenuItems = useMemo(
    () => [
      /*  { id: "configuracion", label: "Configuración", icon: Settings }, */
      /* { id: "ayuda", label: "Ayuda", icon: HelpCircle }, */
    ],
    []
  );
  // Ejemplo de función de ayuda isRouteActive (usando Ziggy/Laravel)
  const isRouteActive = (routeId, query = null) => {
    // 1. Coincidencia directa con patrón simple
    if (!route().current(routeId + "*")) return false;

    // 2. Si hay query (como type=service), verificar que coincida
    if (query) {
        const currentQuery = new URLSearchParams(window.location.search);
        for (const key in query) {
            if (currentQuery.get(key) !== query[key]) return false;
        }
    }

    return true;
  };

  // 🎯 FUNCIÓN CLAVE: Determina si el ÍTEM CONTENEDOR debe estar ACTIVO
  const isItemActive = (item) => {
    // 1. Verificar si el ítem principal tiene una ruta propia activa (ej: 'admin.dashboard')
    if (item.id && route().current(item.id)) {
      return true;
    }

    // 2. Verificar si el ítem tiene submenú y si ALGUNA de sus sub-rutas está activa
    if (item.submenu?.length) {
      return item.submenu.some((sub) => isRouteActive(sub.id, sub.query));
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
        const anyChildActive = item.submenu.some((s) => isRouteActive(s.id, s.query));
        if (anyChildActive) nextOpen[item.id] = true;
      }
    }
    setOpenMenus((prev) => ({ ...prev, ...nextOpen }));
  }, [url, menuItems]);

  const canSwitchContext = useMemo(() => {
    if (userIsSuperAdmin) {
      return (props.all_companies?.length > 1) || (props.available_branches?.length > 1);
    }
    return props.available_branches?.length > 1;
  }, [userIsSuperAdmin, props.all_companies, props.available_branches]);

  return (
    <div className="flex flex-col border-r border-gray-100 shadow-2xl h-full shadow-gray-500/5">
      {/* Header del sidebar */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-50 shrink-0 gap-2 pt-4 pb-2">
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
              {/* LOGO TRIGGER - Abre Modal de Contexto solo si hay opciones */}
              <button 
                onClick={() => canSwitchContext && setIsContextModalOpen(true)}
                className={`group relative shrink-0 transition-transform focus:outline-none ${canSwitchContext ? 'active:scale-95 cursor-pointer' : 'cursor-default'}`}
                title={canSwitchContext ? "Cambiar Empresa / Contexto" : "Entorno único"}
              >
                {current_company?.logo_url ? (
                   <img 
                      src={current_company.logo_url} 
                      alt="Logo" 
                      className={`w-9 h-9 object-contain bg-white rounded-lg shadow-sm border border-gray-100 p-0.5 transition-colors ${canSwitchContext ? 'group-hover:border-brand-primary/50' : ''}`}
                   />
                ) : (
                  <div className={`flex items-center justify-center w-9 h-9 shadow-lg rounded-lg transition-all ${canSwitchContext ? 'bg-brand-primary shadow-brand-primary/20 text-white group-hover:brightness-110' : 'bg-gray-100 text-gray-400 shadow-none'}`}>
                    <HeartPulse className="w-5 h-5" />
                  </div>
                )}
                {/* Indicador visual de que es clickeable si hay múltiples opciones */}
                {canSwitchContext && (
                    <div className="absolute z-50 -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                )}
              </button>
              
              {/* SWITCHER DE SUCURSAL */}
              <div className="flex-1 min-w-0 flex flex-col">
                <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest truncate leading-none mb-1">
                    {current_company?.business_name || "Sysmed"}
                </p>
                <BranchSwitcher />
                
              </div>
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 transition-all hover:bg-gray-50 rounded-lg text-brand-gray hover:text-brand-primary shrink-0"
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
                item.submenu.some((s) => isRouteActive(s.id, s.query))
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
                    className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
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
                  <Link href={route(item.id, item.query || {})}>{MainButton}</Link>
                ) : isContainerOnly ? (
                  MainButton
                ) : hasSubmenu ? (
                  MainButton
                ) : (
                  MainButton
                )}

                {/* Submenu */}
                {hasSubmenu && sidebarOpen && open && (
                  <div className="pl-4 mt-2 ml-6 space-y-1 duration-300 border-l-2 border-gray-100 animate-in slide-in-from-left-2">
                    {item.submenu.map((sub) => {
                      const SubIcon = sub.icon;
                      const subActive = isRouteActive(sub.id, sub.query);
                      return route().has(sub.id) ? (
                        <Link key={sub.id} href={route(sub.id, sub.query || {})}>
                          <div
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                              subActive
                                ? "bg-brand-secondary/10 text-brand-primary font-black"
                                : "text-gray-400 hover:text-brand-primary hover:bg-gray-50"
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
