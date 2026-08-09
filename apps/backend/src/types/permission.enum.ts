import { Role } from './role.enum';

/**
 * The permission vocabulary every feature guards against. `ITEMS_*` belongs to
 * the example feature — rename it alongside src/items when you build a real one,
 * and add a pair per resource.
 */
export enum Permission {
  STAFF_READ = 'STAFF_READ',
  STAFF_WRITE = 'STAFF_WRITE',
  USERS_READ = 'USERS_READ',
  USERS_WRITE = 'USERS_WRITE',
  ITEMS_READ = 'ITEMS_READ',
  ITEMS_WRITE = 'ITEMS_WRITE',
  CATEGORIES_READ = 'CATEGORIES_READ',
  CATEGORIES_WRITE = 'CATEGORIES_WRITE',
  DEALS_READ = 'DEALS_READ',
  DEALS_WRITE = 'DEALS_WRITE',
  VEHICLES_READ = 'VEHICLES_READ',
  VEHICLES_WRITE = 'VEHICLES_WRITE',
  BOOKINGS_READ = 'BOOKINGS_READ',
  BOOKINGS_WRITE = 'BOOKINGS_WRITE',
  INQUIRIES_READ = 'INQUIRIES_READ',
  INQUIRIES_WRITE = 'INQUIRIES_WRITE',
  ASSETS_READ = 'ASSETS_READ',
  ASSETS_WRITE = 'ASSETS_WRITE',
  AUDIT_READ = 'AUDIT_READ',
}

const ALL_PERMISSIONS: Permission[] = Object.values(Permission);

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: ALL_PERMISSIONS,
  [Role.ADMIN]: [
    Permission.STAFF_READ,
    Permission.USERS_READ,
    Permission.USERS_WRITE,
    Permission.ITEMS_READ,
    Permission.ITEMS_WRITE,
    Permission.CATEGORIES_READ,
    Permission.CATEGORIES_WRITE,
    Permission.DEALS_READ,
    Permission.DEALS_WRITE,
    Permission.VEHICLES_READ,
    Permission.VEHICLES_WRITE,
    Permission.BOOKINGS_READ,
    Permission.BOOKINGS_WRITE,
    Permission.INQUIRIES_READ,
    Permission.INQUIRIES_WRITE,
    Permission.ASSETS_READ,
    Permission.ASSETS_WRITE,
    Permission.AUDIT_READ,
  ],
  [Role.EDITOR]: [
    Permission.USERS_READ,
    Permission.ITEMS_READ,
    Permission.ITEMS_WRITE,
    Permission.CATEGORIES_READ,
    Permission.CATEGORIES_WRITE,
    Permission.DEALS_READ,
    Permission.DEALS_WRITE,
    Permission.VEHICLES_READ,
    Permission.VEHICLES_WRITE,
    Permission.BOOKINGS_READ,
    Permission.BOOKINGS_WRITE,
    Permission.INQUIRIES_READ,
    Permission.INQUIRIES_WRITE,
    Permission.ASSETS_READ,
    Permission.ASSETS_WRITE,
  ],
  [Role.VIEWER]: [
    Permission.USERS_READ,
    Permission.ITEMS_READ,
    Permission.CATEGORIES_READ,
    Permission.DEALS_READ,
    Permission.VEHICLES_READ,
    Permission.BOOKINGS_READ,
    Permission.INQUIRIES_READ,
    Permission.ASSETS_READ,
  ],
  // A self-registered end user. Deliberately empty: the admin console is not for them.
  [Role.USER]: [],
};

export function permissionsForRoles(roles: Role[]): Set<Permission> {
  const set = new Set<Permission>();
  for (const role of roles) {
    for (const perm of ROLE_PERMISSIONS[role] ?? []) set.add(perm);
  }
  return set;
}

/** Every role whose permission set includes `permission`. Derived, never hardcoded. */
export function rolesWithPermission(permission: Permission): Role[] {
  return (Object.keys(ROLE_PERMISSIONS) as Role[]).filter((role) =>
    ROLE_PERMISSIONS[role].includes(permission),
  );
}
