"use client";
import { OwnerDashPage } from "@/features/urbify/pages/owner";
import { useRouter } from "next/navigation";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const nav = (p: string) => {
    const map: Record<string, string> = {
      home:'/', search:'/rent', auth:'/auth',
      ownerDash:'/owner/dashboard', ownerList:'/owner/dashboard',
      ownerInquiries:'/owner/dashboard', ownerNew:'/owner/dashboard',
      settings:'/settings', notifications:'/notifications',
    };
    router.push(map[p] || '/owner/dashboard');
  };
  return <OwnerDashPage nav={nav}/>;
}
