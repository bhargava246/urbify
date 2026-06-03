import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/lib/env"; // boot-time env validation — throws if required vars are missing
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AppErrorFallback } from "@/components/shared/ErrorFallback";
import { SiteHeader } from "@/components/shared/SiteHeader";

export const metadata: Metadata = {
  title: "Urbify — Real estate, fair & simple",
  description:
    "Privacy-first Indian real estate marketplace for owners, tenants, brokers, and admins.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-density="regular" data-card="regular" data-dark="false">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
        />
      </head>
      <body>
        <SiteHeader />
        <ErrorBoundary fallback={<AppErrorFallback />}>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
