"use client";

import type { PropsWithChildren } from "react";

export function Modal({
  open,
  onClose,
  children
}: PropsWithChildren<{ open: boolean; onClose: () => void }>) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "rgba(15,22,20,.55)"
      }}
    >
      <section className="card" onClick={(event) => event.stopPropagation()}>
        {children}
      </section>
    </div>
  );
}
