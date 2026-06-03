"use client";
import { AuthPage } from "@/features/urbify/pages/auth";

export default function LoginPage() {
  return <AuthPage nav={(p: string) => { window.location.href = p === "home" ? "/" : `/${p}`; }}/>;
}
