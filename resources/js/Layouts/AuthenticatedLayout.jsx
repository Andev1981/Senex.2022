import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import Nav from "./Partials/Nav";
import Side from "./Partials/Side";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AuthenticatedLayout({ header, children }) {
  const user = usePage().props.auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.message) {
      toast[flash.type || "info"](flash.message);
    }
  }, [flash]);

  return (
    <div className="min-h-screen p-4 bg-center bg-no-repeat bg-cover bg-slate-50">
      <Nav
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <Side sidebarOpen={sidebarOpen} />
      <main className="h-auto pt-10 md:ml-48">{children}</main>
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="dark"
      />
    </div>
  );
}
