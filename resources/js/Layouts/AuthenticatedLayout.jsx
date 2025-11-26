import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import Nav from "./Partials/Nav";
import Side from "./Partials/Side";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AuthenticatedLayout({ header, children }) {
  const user = usePage().props.auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.message) {
      toast[flash.type || "info"](flash.message);
    }
  }, [flash]);

  return (
    <div className="flex w-full overflow-hidden min-h-dvh bg-slate-50">
      <aside
        className={`${
          sidebarOpen ? "w-52" : "w-18"
        } flex-none sticky top-0 h-dvh overflow-y-auto transition-all duration-300`}
      >
        <Side sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </aside>
      <div className="flex flex-col flex-1 min-w-0 h-dvh">
        <Nav
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        limit={3}
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}
