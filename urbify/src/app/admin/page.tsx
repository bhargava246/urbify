"use client";
import { AdminDashPage } from "@/features/urbify/pages/admin";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const nav = (p: string) => {
    const map: Record<string, string> = {
      home: "/",
      search: "/rent",
      auth: "/auth",
      adminDash: "/admin",
      adminMod: "/admin",
      adminUsers: "/admin",
      adminRev: "/admin",
      adminCms: "/admin",
      settings: "/settings",
      notifications: "/notifications",
    };
    router.push(map[p] || "/admin");
  };
  return <AdminDashPage nav={nav} />;
}
