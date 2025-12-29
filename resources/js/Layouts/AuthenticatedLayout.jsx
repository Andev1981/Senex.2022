import { useState } from "react";
import { usePage } from "@inertiajs/react";
import Nav from "./Partials/Nav";
import Side from "./Partials/Side";

export default function AuthenticatedLayout({ header, children }) {
  const user = usePage().props.auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userIsSuperAdmin = usePage().props.auth.roles.includes("superadmin");

  return (
    <div className="flex w-full overflow-hidden min-h-dvh bg-gray-50/50">
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-24"
        } flex-none sticky top-0 h-dvh overflow-y-auto transition-all duration-500 ease-in-out print:hidden`}
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
  );
}
