import React, { useState, useEffect, lazy, Suspense } from "react";
import { usePage } from "@inertiajs/react";
import Nav from "./Partials/Nav";
import Side from "./Partials/Side";
import { toast } from "sonner";
import Swal from "sweetalert2"; // Importar SweetAlert2

const DevToolbar = lazy(() => import("@/Components/DevToolbar"));

export default function AuthenticatedLayout({ header, children }) {
  const user = usePage().props.auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userIsSuperAdmin = usePage().props.auth.roles.includes("superadmin");

  const { flash, env } = usePage().props;

  useEffect(() => {
    if (flash && flash.message) {
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
  }, [flash]);

  return (
    <>
      {env === 'local' && (
        <Suspense fallback={null}>
          <DevToolbar />
        </Suspense>
      )}
      <div className={`flex w-full overflow-hidden min-h-dvh bg-gray-50/50 ${env === 'local' ? 'pt-8' : ''}`}>
        <aside
          className={`${
            sidebarOpen ? "w-72" : "w-24"
          } flex-none sticky top-0 ${env === 'local' ? 'h-[calc(100dvh-32px)]' : 'h-dvh'} overflow-y-auto transition-all duration-500 ease-in-out print:hidden`}
          
        >
          <Side
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            userIsSuperAdmin={userIsSuperAdmin}
          />
        </aside>
        <div className="flex flex-col flex-1 min-w-0 h-dvh relative">
          <div className="print:hidden">
              <Nav
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              />
          </div>
          <main className="flex-1 overflow-y-auto custom-scrollbar">{children}</main>
        </div>
      </div>
    </>
  );
}
