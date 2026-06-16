import type { Role } from "@prisma/client";

// Granular permission model. Roles map to permission sets.
export type Permission =
  | "product.read"
  | "product.write"
  | "order.read"
  | "order.read.own"
  | "order.write"
  | "inventory.write"
  | "customer.read"
  | "admin.access"
  | "tenant.manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "product.read", "product.write", "order.read", "order.write",
    "inventory.write", "customer.read", "admin.access", "tenant.manage",
  ],
  ADMIN: [
    "product.read", "product.write", "order.read", "order.write",
    "inventory.write", "customer.read", "admin.access",
  ],
  STAFF: ["product.read", "order.read", "inventory.write", "admin.access"],
  VENDOR: ["product.read", "product.write", "order.read.own"],
  CUSTOMER: ["product.read", "order.read.own"],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function assert(role: Role, permission: Permission): void {
  if (!can(role, permission)) {
    throw new Error(`Forbidden: role ${role} lacks ${permission}`);
  }
}
