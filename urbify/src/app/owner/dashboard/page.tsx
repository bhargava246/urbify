"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardProvider } from "@/features/urbify/DashboardProvider";
import { OwnerDashPage, OwnerListPage, OwnerInquiriesPage, OwnerNewPage } from "@/features/urbify/pages/owner";

const OWNER_PAGES: Record<string, React.ComponentType<any>> = {
  ownerDash:       OwnerDashPage,
  ownerList:       OwnerListPage,
  ownerInquiries:  OwnerInquiriesPage,
  ownerNew:        OwnerNewPage,
};

function Inner() {
  const router = useRouter();
  const [page, setPage] = useState("ownerDash");

  const nav = (p: string) => {
    if (OWNER_PAGES[p]) { setPage(p); window.scrollTo({top:0,behavior:'instant'}); return; }
    const map: Record<string, string> = {
      home: "/", search: "/rent", auth: "/auth",
      settings: "/settings", notifications: "/notifications",
      detail: "/rent",
    };
    if (map[p]) router.push(map[p]);
  };

  const Page = OWNER_PAGES[page] || OwnerDashPage;
  return <Page nav={nav} />;
}

export default function OwnerDashboardPage() {
  return <DashboardProvider><Inner /></DashboardProvider>;
}
