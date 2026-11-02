import userSystem from "./user_service";
import { ROLE, User } from "../entity/user";

export function isAdmin(user: User) {
  if (!user) return false;
  return user.permission >= ROLE.ADMIN;
}

export function isSuperAdmin(user: User) {
  if (!user) return false;
  return user.permission >= ROLE.SUPER_ADMIN;
}

export function isHaveInstance(user: User, daemonId: string, instanceUuid: string) {
  if (isAdmin(user)) return true;
  if (user && user.instances) {
    for (const v of user.instances) {
      if (daemonId === v.daemonId && instanceUuid === v.instanceUuid) return true;
    }
  }
  return false;
}

export function isTopPermission(user: User) {
  return isSuperAdmin(user);
}

// A regular admin may only manage normal users. It can never modify another
// admin/super-admin, and it cannot change a user's role at all.
export function canManageUser(
  actor: User | null | undefined,
  target: User | null | undefined,
  requestedPermission?: number
) {
  if (!actor) return false;
  if (isSuperAdmin(actor)) return true;
  if (!isAdmin(actor)) return false;
  if (!target) return false;
  if (target.permission >= ROLE.ADMIN) return false;
  if (requestedPermission != null && Number(requestedPermission) !== target.permission) {
    return false;
  }
  return true;
}

export function canCreateUser(actor: User | null | undefined, permission: number) {
  if (!actor) return false;
  if (isSuperAdmin(actor)) return true;
  if (!isAdmin(actor)) return false;
  return Number(permission) === ROLE.USER;
}

export function isTopPermissionByUuid(uuid: string) {
  const user = userSystem.getInstance(uuid);
  if (!user) return false;
  return isTopPermission(user);
}

export function isHaveInstanceByUuid(uuid: string, daemonId: string, instanceUuid: string) {
  const user = userSystem.getInstance(uuid);
  if (!user) return false;
  return isHaveInstance(user, daemonId, instanceUuid);
}

export function getUserByUserName(userName: string) {
  return userSystem.getUserByUserName(userName);
}
