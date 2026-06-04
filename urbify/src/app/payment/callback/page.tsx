"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type VerifyState = "loading" | "success" | "failed" | "error";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const txnId = searchParams.get("txnId");

    if (!txnId) {
      setState("error");
      setMessage("Missing transaction ID. Please contact support.");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("urb_access") : null;
    if (!token) {
      router.replace("/");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/v1/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ merchantTransactionId: txnId }),
        });

        const raw = await res.json();
        // API responses are wrapped: {success, data:{status,...}, timestamp}
        const data = raw?.data ?? raw;

        if (res.ok && (data.status === "COMPLETED" || data.status === "SUCCESS")) {
          setState("success");
          setMessage("Your contact unlock is active! Redirecting to your dashboard…");
          setTimeout(() => router.replace("/dashboard"), 3000);
        } else {
          setState("failed");
          setMessage(
            raw.message || data.message ||
              "Payment could not be confirmed. If money was deducted, it will be auto-refunded in 5-7 days."
          );
        }
      } catch {
        setState("error");
        setMessage("Network error while verifying payment. Please try again or contact support.");
      }
    })();
  }, [searchParams, router]);

  const icon = {
    loading: (
      <svg
        className="animate-spin"
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    ),
    success: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    failed: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    error: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <circle cx="12" cy="16" r="0.5" fill="#f59e0b" />
      </svg>
    ),
  };

  const heading = {
    loading: "Verifying your payment…",
    success: "Payment Successful!",
    failed: "Payment Not Confirmed",
    error: "Something Went Wrong",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "48px 40px",
          maxWidth: 420,
          width: "90%",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: 24, color: state === "loading" ? "#0D7C66" : undefined }}>
          {icon[state]}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "#111827" }}>
          {heading[state]}
        </h1>

        {message && (
          <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            {message}
          </p>
        )}

        {state === "loading" && (
          <p style={{ color: "#9ca3af", fontSize: 13 }}>
            This usually takes a few seconds. Please do not close this tab.
          </p>
        )}

        {(state === "failed" || state === "error") && (
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.replace("/")}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                background: "#0D7C66",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Go to Home
            </button>
            <a
              href="mailto:support@urbify.in"
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                background: "#f3f4f6",
                color: "#374151",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Contact Support
            </a>
          </div>
        )}

        <p style={{ marginTop: 32, color: "#d1d5db", fontSize: 12 }}>
          Powered by PhonePe · PCI-DSS Compliant
        </p>
      </div>
    </main>
  );
}
