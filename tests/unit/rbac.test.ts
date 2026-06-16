import { describe, it, expect } from "vitest";
import { can, assert } from "@/lib/rbac";

describe("RBAC permissions", () => {
  it("grants admins admin access", () => {
    expect(can("ADMIN", "admin.access")).toBe(true);
    expect(can("SUPER_ADMIN", "tenant.manage")).toBe(true);
  });

  it("denies customers admin access", () => {
    expect(can("CUSTOMER", "admin.access")).toBe(false);
    expect(can("CUSTOMER", "product.write")).toBe(false);
  });

  it("lets customers read their own orders only", () => {
    expect(can("CUSTOMER", "order.read.own")).toBe(true);
    expect(can("CUSTOMER", "order.read")).toBe(false);
  });

  it("scopes vendors to their own products/orders", () => {
    expect(can("VENDOR", "product.write")).toBe(true);
    expect(can("VENDOR", "tenant.manage")).toBe(false);
  });

  it("assert throws when permission is missing", () => {
    expect(() => assert("CUSTOMER", "admin.access")).toThrow(/Forbidden/);
    expect(() => assert("ADMIN", "admin.access")).not.toThrow();
  });
});
