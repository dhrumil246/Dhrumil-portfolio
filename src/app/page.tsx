"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import TerminalWindow from "@/components/layout/TerminalWindow";
import EntryScreen from "@/components/layout/EntryScreen";
import PixelTransition from "@/components/ui/PixelTransition"; // Added import

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
  const renderEnabled = useTerminalStore((s) => s.renderEnabled);
  const toggleRender = useTerminalStore((s) => s.toggleRender);
  const lastCommand = useTerminalStore((s) => s.lastCommand);
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
      pixelColor="#28c840" 
      animationStepDuration={0.4}
      className="w-full h-screen"
      secondContent={
        <div
          data-theme={theme}
          className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 theme-transition"
          style={{
            background: "var(--bg)",
            backgroundImage:
              "radial-gradient(ellipse at 50% 40%, rgba(56, 189, 248, 0.04) 0%, transparent 70%)",
          }}
        >
          {/* ─── Main Layout ─── */}
          <div
            className="w-full flex gap-4 transition-all duration-300"
            style={{ maxWidth: renderEnabled ? 1100 : 760 }}
          >
            {/* Terminal — always visible */}
            <TerminalWindow />

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
                  {/* Traffic lights — red closes the panel */}
                  <div className="flex gap-[7px] shrink-0">
                    <button
                      onClick={() => toggleRender()}
                      className="w-3 h-3 rounded-full"
                      style={{ background: "#ff5f57" }}
                      title="Close render panel"
                      aria-label="Close render panel"
                    />
                    <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
                  </div>

                  {/* Path */}
                  <span className="flex-1 text-center terminal-text text-xs" style={{ color: "var(--text-dim)" }}>
                    {lastCommand === "projects" || lastCommand === "project"
                      ? "render://projects"
                      : "render://skills-graph"}
                  </span>

                  {/* Live indicator */}
                  <span className="terminal-text text-xs shrink-0" style={{ color: "var(--green)" }}>
                    ● LIVE
                  </span>
                </div>
                <div className="flex-1 min-h-[440px] rounded-b-xl overflow-hidden">
                  <RenderCanvas />
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
              Dhrumil Amin • Developer
            </span>
            <span className="terminal-text text-xs text-[var(--text-dim)]">
              render: {renderEnabled ? "on" : "off"} • {theme}
            </span>
          </div>
        </div>
      }
    />
  );
}