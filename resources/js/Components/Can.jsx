import { usePermission } from "@/Hooks/usePermission";

export default function Can({ permission, role, children, fallback = null }) {
  const { hasPermission, hasRole } = usePermission();

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  if (role && !hasRole(role)) {
    return fallback;
  }

  return <>{children}</>;
}
