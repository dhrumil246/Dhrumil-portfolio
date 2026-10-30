"use client";

import { useEffect, useState, useRef } from "react";
import ShapeGrid from "@/components/ui/ShapeGrid";

// Real stack, real numbers — the boot log doubles as a project teaser.
const BOOT_LOGS = [
  "BIOS v2.15 — dhrumil@portfolio",
  "Mounting /projects... [OK]",
  "Loading kernel modules: react, three, zustand... [OK]",
  "Loading WaferCNN weights... [615,801 params]",
  "Starting MCP server... [14 tools ready]",
  "Calibrating conformal intervals... [94.0% coverage]",
  "Opening Sarvam realtime stream... [hi-IN]",
  "Bridging Twilio media socket... [Connected]",
  "Initializing WebGL context... [OK]",
  "Compiling render shaders... [Done]",
  "System diagnostics normal.",
];

// How long the "SYSTEM READY" prompt shows before advancing on its own.
const AUTO_ADVANCE_MS = 700;

export default function EntryScreen({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  // One guard for both paths (skip and auto-advance). A ref, not a local, because
  // the parent passes a fresh onComplete each render and effects re-subscribe.
  const triggered = useRef(false);
  const finish = useRef(onComplete);
  finish.current = onComplete;
  const trigger = () => {
    if (triggered.current) return;
    triggered.current = true;
    finish.current();
  };

  // Stream logs
  useEffect(() => {
    let currentIndex = 0;
    let promptTimer: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      if (currentIndex < BOOT_LOGS.length) {
        // Read the entry now: the updater can run later, after the increment,
        // which appended BOOT_LOGS[length] (undefined) as a blank timestamped row
        const entry = BOOT_LOGS[currentIndex];
        setLogs((prev) => [...prev, entry]);
        currentIndex++;
      } else {
        clearInterval(interval);
        promptTimer = setTimeout(() => setShowPrompt(true), 400); // slight pause before prompt
      }
    }, 75); // fast log speed

    return () => {
      clearInterval(interval);
      clearTimeout(promptTimer);
    };
  }, []);

  // No click gate: hand off on our own once the prompt has been read
  useEffect(() => {
    if (!showPrompt) return;
    const t = setTimeout(trigger, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [showPrompt]);

  // Click / Enter / Space / Esc skips at any point
  useEffect(() => {
    const handleInteraction = (e: KeyboardEvent | MouseEvent) => {
      if (e.type === "keydown" && !["Enter", " ", "Escape"].includes((e as KeyboardEvent).key)) return;
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      trigger();
    };

    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("click", handleInteraction);

    return () => {
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("click", handleInteraction);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-pointer select-none overflow-hidden"
      style={{
        background: "#050505",
        fontFamily: "var(--font-mono), monospace",
      }}
    >
      {/* ─── Brutalist Background Typography ─── */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <h1 
          className="text-[18vw] md:text-[14vw] font-black tracking-tighter leading-[0.85] whitespace-nowrap text-center"
          style={{ 
             color: "#1a1a24", // Solid deep dark gray body
             WebkitTextStroke: "2px rgba(255, 255, 255, 0.15)", // Glowing white stroke to define the edges
             textShadow: "0 0 20px rgba(255, 255, 255, 0.05)" // Slight ambient glow
          }}
        >
          DHRUMIL<br />AMIN
        </h1>
      </div>

      {/* ─── Animated Shape Grid ─── */}
      <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen">
        <ShapeGrid 
          direction="diagonal"
          borderColor="rgba(255, 255, 255, 0.2)" // 20% white so the grid is incredibly pronounced
          hoverFillColor="#28c840" 
          squareSize={40}
          shape="square" 
          speed={0.5}
        />
      </div>

      {/* ─── CRT Scanlines (horizontal only — ShapeGrid already draws the grid) ─── */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.18) 0px, rgba(0, 0, 0, 0.18) 1px, transparent 1px, transparent 3px)",
        }}
      />
      
      {/* ─── Central Console Box ─── */}
      <div 
        className="relative z-20 w-full max-w-3xl border flex flex-col rounded-xl overflow-hidden"
        style={{ 
          borderColor: "var(--border)", 
          background: "rgba(10, 14, 23, 0.8)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 40px rgba(0,0,0,0.6)"
        }}
      >
        {/* Terminal Header */}
        <div className="relative flex items-center px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--header-bg)" }}>
          <div className="flex gap-2 relative z-10">
            <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs opacity-40 uppercase tracking-widest pointer-events-none">
            boot_sequence_v2.0
          </div>
        </div>

        {/* Logs */}
        <div className="p-6 md:p-8 flex flex-col justify-end text-[13px] md:text-[14px] leading-relaxed min-h-[420px]">
          <div className="flex flex-col space-y-1.5 flex-1">
            {logs.map((log, i) => (
              <div key={i} style={{ color: "var(--textDim)", opacity: 0.9 }}>
                <span className="opacity-40 mr-3 hidden sm:inline-block w-[60px] text-right">{`[${(i * 0.133).toFixed(3)}]`}</span>
                {log}
              </div>
            ))}
          </div>

          {/* Prompt */}
          <div className="h-[24px] mt-8 flex-shrink-0">
            {showPrompt && (
              <div 
                className="font-bold text-[14px] md:text-[15px] animate-pulse" 
                style={{ color: "var(--green)" }}
              >
                {"> SYSTEM READY. INITIATING UPLINK_"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
