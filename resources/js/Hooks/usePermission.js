import { usePage } from "@inertiajs/react";
import { useCallback } from "react";

export function usePermission() {
  const { auth } = usePage().props;

  const hasPermission = useCallback((permission) => {
    if (!auth || !auth.permissions) {
      return false;
    }
    return auth.permissions.includes(permission);
  }, [auth]);

  const hasRole = useCallback((role) => {
    if (!auth || !auth.roles) {
      return false;
    }
    return auth.roles.includes(role);
  }, [auth]);

  const hasAnyPermission = useCallback((permissions) => {
    return permissions.some((permission) => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions) => {
    return permissions.every((permission) => hasPermission(permission));
  }, [hasPermission]);

  const hasAnyRole = useCallback((roles) => {
    return roles.some((role) => hasRole(role));
  }, [hasRole]);

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
  };
}
