import { describe, expect, it } from "vitest";
import { ROLE, User } from "../../entity/user";
import { canCreateUser, canManageUser, isAdmin, isSuperAdmin } from "../permission_service";

function user(permission: number) {
  const result = new User();
  result.permission = permission;
  return result;
}

describe("three-role permission model", () => {
  it("recognizes admin and super admin thresholds", () => {
    expect(isAdmin(user(ROLE.USER))).toBe(false);
    expect(isAdmin(user(ROLE.ADMIN))).toBe(true);
    expect(isAdmin(user(ROLE.SUPER_ADMIN))).toBe(true);
    expect(isSuperAdmin(user(ROLE.ADMIN))).toBe(false);
    expect(isSuperAdmin(user(ROLE.SUPER_ADMIN))).toBe(true);
  });

  it("lets an admin manage normal users without changing their role", () => {
    const admin = user(ROLE.ADMIN);
    const normal = user(ROLE.USER);
    expect(canManageUser(admin, normal)).toBe(true);
    expect(canManageUser(admin, normal, ROLE.USER)).toBe(true);
    expect(canManageUser(admin, normal, ROLE.ADMIN)).toBe(false);
    expect(canManageUser(admin, normal, ROLE.SUPER_ADMIN)).toBe(false);
  });

  it("forbids an admin from managing admins or super admins", () => {
    const admin = user(ROLE.ADMIN);
    expect(canManageUser(admin, user(ROLE.ADMIN))).toBe(false);
    expect(canManageUser(admin, user(ROLE.SUPER_ADMIN))).toBe(false);
    expect(canManageUser(admin, null)).toBe(false);
  });

  it("lets a super admin manage every role and change roles", () => {
    const superAdmin = user(ROLE.SUPER_ADMIN);
    expect(canManageUser(superAdmin, user(ROLE.USER), ROLE.ADMIN)).toBe(true);
    expect(canManageUser(superAdmin, user(ROLE.ADMIN), ROLE.SUPER_ADMIN)).toBe(true);
    expect(canManageUser(superAdmin, user(ROLE.SUPER_ADMIN), ROLE.USER)).toBe(true);
  });

  it("only lets an admin create normal users", () => {
    expect(canCreateUser(user(ROLE.ADMIN), ROLE.USER)).toBe(true);
    expect(canCreateUser(user(ROLE.ADMIN), ROLE.ADMIN)).toBe(false);
    expect(canCreateUser(user(ROLE.ADMIN), ROLE.SUPER_ADMIN)).toBe(false);
    expect(canCreateUser(user(ROLE.SUPER_ADMIN), ROLE.ADMIN)).toBe(true);
    expect(canCreateUser(user(ROLE.USER), ROLE.USER)).toBe(false);
  });
});
