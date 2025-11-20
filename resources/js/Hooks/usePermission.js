import { usePage } from "@inertiajs/react";

export function usePermission() {
  const { auth } = usePage().props;

  const hasPermission = (permission) => {
    if (!auth.user || !auth.user.permissions) {
      return false;
    }
    return auth.user.permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!auth.user || !auth.user.roles) {
      return false;
    }
    return auth.user.roles.includes(role);
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const hasAnyRole = (roles) => {
    return roles.some((role) => hasRole(role));
  };

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
  };
}
