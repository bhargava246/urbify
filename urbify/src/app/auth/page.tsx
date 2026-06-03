"use client";
import { AuthPage } from "@/features/urbify/pages/auth";

export default function AuthPageRoute() {
  const nav = (p: string) => { window.location.href = p === "home" ? "/" : `/${p}`; };
  return <AuthPage nav={nav}/>;
}
