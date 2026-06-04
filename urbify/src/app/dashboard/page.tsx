"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardProvider } from "@/features/urbify/DashboardProvider";
import { ClientDashPage, ClientShortlistPage, ClientSearchesPage } from "@/features/urbify/pages/client-broker";
import { ClientTxPage, SettingsPage } from "@/features/urbify/pages/extra";

const CLIENT_PAGES: Record<string, React.ComponentType<any>> = {
  clientDash:    ClientDashPage,
  clientShort:   ClientShortlistPage,
  clientTx:      ClientTxPage,
  clientSearches: ClientSearchesPage,
  settings:      SettingsPage,
};

function Inner() {
  const router = useRouter();
  const [page, setPage] = useState("clientDash");

  const nav = (p: string) => {
    if (CLIENT_PAGES[p]) { setPage(p); window.scrollTo({top:0,behavior:'instant'}); return; }
    const map: Record<string, string> = {
      home: "/", search: "/rent", auth: "/auth",
      how: "/how-it-works", pricing: "/pricing",
      ownerDash: "/owner/dashboard",
      brokerDash: "/broker/dashboard",
      notifications: "/notifications",
      detail: "/rent",
    };
    if (map[p]) router.push(map[p]);
  };

  const Page = CLIENT_PAGES[page] || ClientDashPage;
  return <Page nav={nav} savedIds={[]} onSave={()=>{}} onUnlock={()=>{}}/>;
}

export default function DashboardPage() {
  return <DashboardProvider><Inner /></DashboardProvider>;
}
