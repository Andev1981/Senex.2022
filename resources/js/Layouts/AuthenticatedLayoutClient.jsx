import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import NavClient from "./Partials/NavClient";

export default function AuthenticatedLayoutClient({ header, children }) {
  const user = usePage().props.auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash?.message) {
      // toast[flash.type || "info"](flash.message);
    }
  }, [flash]);

  return (
    <div
      className="min-h-screen bg-gray-50/50"
    >
      <NavClient
        user={user}
      />
      <main className="h-auto">{children}</main>
    </div>
  );
}
