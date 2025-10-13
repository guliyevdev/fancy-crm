import { useUser } from "../contexts/UserContext";

export const usePermission = () => {
  const { user } = useUser();
  const permissions = user?.permissions || [];

  // Bir permission varsa
  const hasPermission = (perm) => permissions.includes(perm);

  // Bir neçə permissiondan biri varsa (OR)
  const hasAnyPermission = (permArray = []) =>
    permArray.some((perm) => permissions.includes(perm));

  // Bütün permissionlar varsa (AND)
  const hasAllPermissions = (permArray = []) =>
    permArray.every((perm) => permissions.includes(perm));

  return { hasPermission, hasAnyPermission, hasAllPermissions };
};
