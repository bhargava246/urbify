"use client";
import { ClientDashPage } from "@/features/urbify/pages/client-broker";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const nav = (p: string) => {
    const map: Record<string, string> = {
      home:'/', search:'/rent', auth:'/auth/login', how:'/how-it-works',
      pricing:'/pricing', clientDash:'/dashboard', clientShort:'/dashboard',
      clientTx:'/dashboard', clientSearches:'/dashboard', ownerDash:'/owner/dashboard',
      brokerDash:'/broker/dashboard', settings:'/settings', notifications:'/notifications',
    };
    router.push(map[p] || '/');
  };
  return <ClientDashPage nav={nav}/>;
}
