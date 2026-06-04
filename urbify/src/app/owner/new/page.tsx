"use client";
import { useRouter } from "next/navigation";
import { DashboardProvider } from "@/features/urbify/DashboardProvider";
import { OwnerNewPage } from "@/features/urbify/pages/owner";

function Inner() {
  const router = useRouter();
  const nav = (p: string) => {
    const map: Record<string, string> = {
      home: "/", auth: "/auth",
      ownerDash: "/owner/dashboard",
      ownerNew: "/owner/new",
      settings: "/settings",
    };
    // After submit, go back to owner dashboard
    if (p === "ownerDash") { router.push("/owner/dashboard"); return; }
    router.push(map[p] || "/owner/dashboard");
  };
  return <OwnerNewPage nav={nav} />;
}

export default function OwnerNewListingPage() {
  return <DashboardProvider><Inner /></DashboardProvider>;
}
