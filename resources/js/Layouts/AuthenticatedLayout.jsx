import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import Nav from "./Partials/Nav";
import Side from "./Partials/Side";
import { ToastContainer, toast } from "react-toastify";

export default function AuthenticatedLayout({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  /* const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.message) {
      toast[flash.type || "info"](flash.message);
    }
  }, [flash]); */

  /* console.log("Usuario: ", user);
   */
  return (
    <div className="min-h-screen p-4 bg-center bg-no-repeat bg-cover bg-slate-50">
      <Nav
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <Side sidebarOpen={sidebarOpen} />
      <main className="h-auto pt-10 md:ml-52">{children}</main>
    </div>
  );
}
