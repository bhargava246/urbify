"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="card" style={{ maxWidth: 520 }}>
        <h1 className="font-display" style={{ marginTop: 0 }}>Something went wrong</h1>
        <p className="muted">The app hit an unexpected error while loading this view.</p>
        <button className="btn btn-brand" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
