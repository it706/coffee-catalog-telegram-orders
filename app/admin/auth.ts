import { createHash } from "crypto";

export const adminCookieName = "valerys_admin_session";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}

export function getAdminSessionValue() {
  return createHash("sha256").update(`valerys-coffee:${getAdminPassword()}`).digest("hex");
}
