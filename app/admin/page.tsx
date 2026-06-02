import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminPanel from "./AdminPanel";
import { adminCookieName, getAdminSessionValue } from "./auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(adminCookieName)?.value;

  if (session !== getAdminSessionValue()) {
    redirect("/admin/login");
  }

  return <AdminPanel />;
}
