"use client";

import { startTransition } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function ThemeToggle() {
  const theme = useTerminalStore((s) => s.theme);
  const toggleTheme = useTerminalStore((s) => s.toggleTheme);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Use View Transitions API for smooth theme switch
    startTransition(() => {
      toggleTheme();
    });
  };

  return (
    <button
      onClick={handleToggle}
      className="theme-transition"
      style={{
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: 4,
        color: "var(--text-dim)",
        fontSize: 12,
        padding: "2px 8px",
        cursor: "pointer",
        fontFamily: "var(--font-mono), monospace",
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}