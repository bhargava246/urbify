"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardProvider } from "@/features/urbify/DashboardProvider";
import { AdminDashPage, AdminModPage, AdminUsersPage, AdminRevenuePage, AdminCmsPage } from "@/features/urbify/pages/admin";

const ADMIN_PAGES: Record<string, React.ComponentType<any>> = {
  adminDash:  AdminDashPage,
  adminMod:   AdminModPage,
  adminUsers: AdminUsersPage,
  adminRev:   AdminRevenuePage,
  adminCms:   AdminCmsPage,
};

function Inner() {
  const router = useRouter();
  const [page, setPage] = useState("adminDash");

  const nav = (p: string) => {
    if (ADMIN_PAGES[p]) { setPage(p); return; }
    const map: Record<string, string> = {
      home: "/", search: "/rent", auth: "/auth",
      settings: "/settings", notifications: "/notifications",
      locality: "/rent", blogPost: "/blog",
    };
    if (map[p]) router.push(map[p]);
  };

  const Page = ADMIN_PAGES[page] || AdminDashPage;
  return <Page nav={nav} />;
}

export default function AdminPage() {
  return <DashboardProvider><Inner /></DashboardProvider>;
}
