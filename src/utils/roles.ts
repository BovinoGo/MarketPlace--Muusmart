import type { SessionRole } from "../types";

export function isSellerRole(role?: SessionRole | string): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return r !== "buyer" && r !== "comprador";
}
