import React, { useState, useEffect, lazy, Suspense } from "react";
import { usePage } from "@inertiajs/react";
import Nav from "./Partials/Nav";
import Side from "./Partials/Side";
import { toast } from "sonner";
import Swal from "sweetalert2"; // Importar SweetAlert2
import { useSessionKeeper } from '@/hooks/useSessionKeeper';

const DevToolbar = lazy(() => import("@/components/DevToolbar"));

export default function AuthenticatedLayout({ header, children }) {
  const isOnline = useSessionKeeper(5);
  const user = usePage().props.auth.user;
  const roles = usePage().props.auth.roles || [];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userIsSuperAdmin = roles.includes("superadmin");
  const userIsAdmin = roles.includes("admin");
  const userIsCajero = roles.includes("cajero");

  const { flash, env } = usePage().props;

  useEffect(() => {
    // Si es cajero, cerramos el sidebar por defecto si es que se llegara a mostrar
    if (userIsCajero) {
      setSidebarOpen(false);
    }
  }, [userIsCajero]);

  useEffect(() => {
    if (flash) {
      if (flash.success) {
        toast.success(flash.success);
      }
      if (flash.error) {
        toast.error(flash.error);
      }
      if (flash.message) {
        if (flash.type === 'success') {
          toast.success(flash.message);
        } else if (flash.type === 'error') {
          toast.error(flash.message);
        } else if (flash.type === 'warning') {
          toast.warning(flash.message);
        } else if (flash.type === 'info') {
          toast.info(flash.message);
        } else {
          toast(flash.message); // Default toast
        }
      }
    }
  }, [flash]);

  // En tu Layout principal de React

  return (
    <>
      {(env === 'local' || userIsSuperAdmin) && (
        <Suspense fallback={null}>
          <DevToolbar />
        </Suspense>
      )}
      <div className={`flex w-full overflow-hidden min-h-dvh bg-gray-50/50 ${(env === 'local' || userIsSuperAdmin) ? 'pt-8' : ''}`}>
      {/* Banner de Advertencia */}
            {!isOnline && (
                <div className="bg-red-600 text-white text-center py-2 sticky top-0 z-50 animate-pulse">
                    ⚠️ <strong>Atención:</strong> Se ha perdido la conexión con el servidor. 
                    No cierres esta ventana para no perder los cambios.
                </div>
            )}
        {!userIsCajero && (
          <aside
            className={`${
              sidebarOpen ? "w-72" : "w-24"
            } flex-none sticky top-0 ${env === 'local' ? 'h-[calc(100dvh-32px)]' : 'h-dvh'} overflow-y-auto transition-all duration-500 ease-in-out print:hidden`}
            
          >
            <Side
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              userIsSuperAdmin={userIsSuperAdmin}
              userIsAdmin={userIsAdmin}
            />
          </aside>
        )}
        <div className="flex flex-col flex-1 min-w-0 h-dvh relative">
          {!userIsCajero && (
            <div className="print:hidden">
                <Nav
                user={user}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                />
            </div>
          )}
          <main className="flex-1 overflow-y-auto custom-scrollbar">{children}</main>
        </div>
      </div>
    </>
  );
}
