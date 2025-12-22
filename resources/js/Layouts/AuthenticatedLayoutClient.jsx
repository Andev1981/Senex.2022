import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import Nav from "./Partials/Nav";

export default function AuthenticatedLayoutClient({ header, children }) {
  const user = usePage().props.auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.message) {
      toast[flash.type || "info"](flash.message);
    }
  }, [flash]);

  return (
    <div
      className="min-h-screen p-4 bg-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1)), url('./../assets/img/bg.png')`,
      }}
    >
      <Nav
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main className="h-auto pt-10">{children}</main>
    </div>
  );
}
