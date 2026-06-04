"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardProvider } from "@/features/urbify/DashboardProvider";
import { BrokerDashPage } from "@/features/urbify/pages/client-broker";
import { OwnerInquiriesPage, OwnerNewPage } from "@/features/urbify/pages/owner";
import { BrokerPortfolioPage } from "@/features/urbify/pages/extra";
import { AdminRevenuePage } from "@/features/urbify/pages/admin";
import { BROKER_NAV } from "@/features/urbify/pages/client-broker";

const BROKER_PAGES: Record<string, React.ComponentType<any>> = {
  brokerDash:       BrokerDashPage,
  brokerList:       BrokerPortfolioPage,
  brokerInq:        (props: any) => <OwnerInquiriesPage {...props} navItems={BROKER_NAV()} navCurrent="brokerInq" roleLabel="Verified Broker"/>,
  brokerCommission: AdminRevenuePage,
  ownerNew:         OwnerNewPage,
};

function Inner() {
  const router = useRouter();
  const [page, setPage] = useState("brokerDash");

  const nav = (p: string) => {
    if (BROKER_PAGES[p]) { setPage(p); window.scrollTo({top:0,behavior:'instant'}); return; }
    const map: Record<string, string> = {
      home: "/", search: "/rent", auth: "/auth",
      settings: "/settings", notifications: "/notifications",
      detail: "/rent",
    };
    if (map[p]) router.push(map[p]);
  };

  const Page = BROKER_PAGES[page] || BrokerDashPage;
  return <Page nav={nav} />;
}

export default function BrokerDashboardPage() {
  return <DashboardProvider><Inner /></DashboardProvider>;
}
