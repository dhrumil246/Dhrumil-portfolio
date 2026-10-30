"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { detectDevice } from "@/lib/deviceCheck";
import Terminal from "@/components/terminal/Terminal";
import CommandChips from "@/components/ui/CommandChips";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { executeCommand } from "@/components/terminal/commands";
import { getHistoryPrompt } from "@/components/terminal/Prompt";
import { line } from "@/lib/commandParser";

// `revealed` flips when the entry screen hands off. The terminal is mounted
// (hidden) from page load, so anything that should be *seen* animating keys off it.
export default function TerminalWindow({ revealed }: { revealed: boolean }) {
  const appendOutput = useTerminalStore((s) => s.appendOutput);
  const clearOutput = useTerminalStore((s) => s.clearOutput);
  const pushHistory = useTerminalStore((s) => s.pushHistory);
  const setLastCommand = useTerminalStore((s) => s.setLastCommand);
  const setDeviceType = useTerminalStore((s) => s.setDeviceType);

  const autoOpenedRender = useRef(false);

  // Auto-open the 3D panel once on desktop when the terminal is revealed — it's
  // the portfolio's showcase and was otherwise hidden behind a toggle.
  useEffect(() => {
    if (autoOpenedRender.current || !revealed) return;
    const state = useTerminalStore.getState();
    if (state.deviceType !== "mobile" && !state.renderEnabled) {
      autoOpenedRender.current = true;
      state.toggleRender();
    }
  }, [revealed]);

  // Detect device on mount
  useEffect(() => {
    setDeviceType(detectDevice());

    const handleResize = () => setDeviceType(detectDevice());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setDeviceType]);

  // Command execution handler for chips
  const handleChipCommand = useCallback(
    (cmd: string) => {
      const promptLine = line(`${getHistoryPrompt()}${cmd}`, "accent");
      const result = executeCommand(cmd);

      if (cmd === "clear") {
        clearOutput();
      } else {
        appendOutput([promptLine, ...result]);
      }

      pushHistory(cmd);
      setLastCommand(cmd);
    },
    [appendOutput, clearOutput, pushHistory, setLastCommand]
  );

  return (
    <div
      className="flex-1 min-w-0 rounded-xl flex flex-col theme-transition"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow)",
        maxHeight: "90vh",
        minHeight: "min(500px, 75vh)",
      }}
    >
      {/* ─── Title Bar ─── */}
      <div
        className="flex items-center px-4 py-2.5 gap-2 select-none shrink-0 rounded-t-xl"
        style={{
          background: "var(--header-bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Traffic lights */}
        <div className="flex gap-[7px]">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: "#ff5f57" }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: "#febc2e" }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: "#28c840" }}
          />
        </div>

        {/* Title */}
        <div
          className="flex-1 text-center terminal-text text-xs"
          style={{ color: "var(--text-dim)" }}
        >
          dhrumilamin@portfolio ~ zsh
        </div>

        {/* Toggles */}
        <div className="flex gap-1.5">
          <ThemeToggle />
        </div>
      </div>

      {/* ─── Terminal Body ─── */}
      <Terminal />

      {/* ─── Command Chips ─── */}
      <CommandChips onCommand={handleChipCommand} visible={revealed} />
    </div>
  );
}