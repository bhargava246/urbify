"use client";

export function AppErrorFallback() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "40px 32px",
          maxWidth: 480,
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#111827" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
          The page hit an unexpected error. Refreshing usually fixes it.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            background: "#0D7C66",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Reload page
        </button>
      </div>
    </main>
  );
}
