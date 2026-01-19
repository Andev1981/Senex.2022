// resources/js/components/DropdownLink.jsx
import React from "react";
import { Link } from "@inertiajs/react";

export default function DropdownLink({ href, children, className = "" }) {
  return (
    <Link
      href={href}
      className={
        "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 " + className
      }
    >
      {children}
    </Link>
  );
}
