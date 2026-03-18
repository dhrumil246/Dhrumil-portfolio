"use client";

import { startTransition } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function RenderToggle() {
  const renderEnabled = useTerminalStore((s) => s.renderEnabled);
  const toggleRender = useTerminalStore((s) => s.toggleRender);
  const deviceType = useTerminalStore((s) => s.deviceType);

  const isMobile = deviceType === "mobile";

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Wrap in startTransition so View Transitions can animate the render panel
    startTransition(() => {
      toggleRender();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isMobile}
      className="theme-transition"
      style={{
        background: renderEnabled ? "var(--accent)20" : "none",
        border: `1px solid ${renderEnabled ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 4,
        color: renderEnabled ? "var(--accent)" : "var(--text-dim)",
        fontSize: 12,
        padding: "2px 8px",
        cursor: isMobile ? "not-allowed" : "pointer",
        fontFamily: "var(--font-mono), monospace",
        opacity: isMobile ? 0.5 : 1,
      }}
      title={
        isMobile
          ? "Render mode disabled on mobile"
          : `${renderEnabled ? "Disable" : "Enable"} 3D render mode`
      }
      aria-label={`${renderEnabled ? "Disable" : "Enable"} 3D render mode`}
    >
      3D
    </button>
  );
}