"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import TerminalWindow from "@/components/layout/TerminalWindow";
import EntryScreen from "@/components/layout/EntryScreen";
import PixelTransition from "@/components/ui/PixelTransition";
import RenderBoundary from "@/render/RenderBoundary";

// Lazy-load render canvas — never loads unless user opts in
const RenderCanvas = dynamic(() => import("@/render/RenderCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <span className="terminal-text text-[var(--text-dim)]">
        Loading render engine...
      </span>
    </div>
  ),
});

export default function Home() {
  const [hasBooted, setHasBooted] = useState(false);
  const theme = useTerminalStore((s) => s.theme);
  const isMobile = useTerminalStore((s) => s.deviceType === "mobile");
  const { name, title } = useTerminalStore((s) => s.portfolioData.PROFILE);
  const renderEnabled = useTerminalStore((s) => s.renderEnabled);
  const toggleRender = useTerminalStore((s) => s.toggleRender);
  const lastCommand = useTerminalStore((s) => s.lastCommand);
  // lastCommand is the full input ("project vaani"), so match the verb
  const showsProjects = lastCommand?.startsWith("project") ?? false;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PixelTransition
      isTriggered={hasBooted}
      firstContent={<EntryScreen onComplete={() => setHasBooted(true)} />}
      gridSize={12}
      pixelColor="#a3e635" /* --accent */ 
      animationStepDuration={0.4}
      className="w-full h-screen"
      secondContent={
        <div
          data-theme={theme}
          className="min-h-screen flex flex-col items-center justify-center p-4 theme-transition"
          style={{
            background: "var(--bg)",
            // body sets color in dark :root scope; re-resolve it inside the theme
            color: "var(--text)",
          }}
        >
          {/* ─── Main Layout ─── */}
          <div
            className="w-full flex gap-4 transition-all duration-300"
            style={{ maxWidth: renderEnabled ? 1100 : 760 }}
          >
            {/* Terminal — always visible */}
            <TerminalWindow revealed={hasBooted} />

            {/* Render Panel */}
            {renderEnabled && (
              <div
                className="w-[360px] rounded-xl flex flex-col theme-transition"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow)",
                  animation: "slide-in-right 0.35s ease-out forwards",
                }}
              >
                <div
                  className="px-4 py-2.5 flex items-center gap-2 rounded-t-xl"
                  style={{
                    background: "var(--header-bg)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {/* Path */}
                  <span className="flex-1 terminal-text text-xs" style={{ color: "var(--text-dim)" }}>
                    {showsProjects ? "render://projects" : "render://skills-graph"}
                  </span>

                  {/* Close — a labelled control instead of a red macOS dot */}
                  <button
                    onClick={() => toggleRender()}
                    className="terminal-text text-xs shrink-0 render-close"
                    title="Close render panel"
                    aria-label="Close render panel"
                  >
                    close ×
                  </button>
                </div>
                <div className="flex-1 min-h-[440px] rounded-b-xl overflow-hidden">
                  <RenderBoundary>
                    <RenderCanvas />
                  </RenderBoundary>
                </div>
              </div>
            )}
          </div>

          {/* ─── Status Bar ─── */}
          <div
            className="w-full mt-2 flex justify-between items-center px-1 transition-all duration-300"
            style={{ maxWidth: renderEnabled ? 1100 : 760 }}
          >
            <span className="terminal-text text-xs text-[var(--text-dim)]">
              {name} • {title.split(".")[0]}
            </span>
            <span className="terminal-text text-xs text-[var(--text-dim)]">
              {/* render mode doesn't exist on mobile, so don't report on it */}
              {isMobile ? theme : `render: ${renderEnabled ? "on" : "off"} • ${theme}`}
            </span>
          </div>
        </div>
      }
    />
  );
}