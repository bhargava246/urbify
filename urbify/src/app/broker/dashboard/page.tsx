"use client";
import { BrokerDashPage } from "@/features/urbify/pages/client-broker";
import { useRouter } from "next/navigation";

export default function BrokerDashboardPage() {
  const router = useRouter();
  const nav = (p: string) => {
    const map: Record<string, string> = {
      home:'/', search:'/rent', auth:'/auth',
      brokerDash:'/broker/dashboard', brokerList:'/broker/dashboard',
      brokerInq:'/broker/dashboard', settings:'/settings',
    };
    router.push(map[p] || '/broker/dashboard');
  };
  return <BrokerDashPage nav={nav}/>;
}
