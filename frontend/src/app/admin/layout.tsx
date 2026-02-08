import { getSession } from "@/lib/admin-auth";
import AdminShell from "@/components/admin/AdminShell";
import { headers } from "next/headers";

export const metadata = {
  title: "George Herald CMS",
  description: "George Herald Content Management System",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-next-pathname") || headerList.get("x-invoke-path") || "";

  // Login page renders without the admin shell
  if (pathname.includes("/admin/login")) {
    return <>{children}</>;
  }

  const session = await getSession();
  if (!session) {
    // This case is handled by middleware redirect, but as a fallback:
    return <>{children}</>;
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
