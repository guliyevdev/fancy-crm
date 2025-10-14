import { useUser } from "../contexts/UserContext";

export const usePermission = () => {
  const { user } = useUser();
  const permissions = user?.permissions || [];

  const hasPermission = (perm) => permissions.includes(perm);

  const hasAnyPermission = (permArray = []) =>
    permArray.some((perm) => permissions.includes(perm));

  const hasAllPermissions = (permArray = []) =>
    permArray.every((perm) => permissions.includes(perm));

  return { hasPermission, hasAnyPermission, hasAllPermissions };
};
