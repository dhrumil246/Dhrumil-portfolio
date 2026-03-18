// Zustand v5 — create<State>()(...) double-call pattern for TypeScript
import { create } from "zustand";
import { detectDevice, type DeviceType } from "@/lib/deviceCheck";

export interface TerminalLine {
  text: string;
  color:
    | "text"
    | "textDim"
    | "accent"
    | "green"
    | "yellow"
    | "red"
    | "pink"
    | "cyan"
    | "orange";
  href?: string;
}

interface TerminalState {
  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Render mode
  renderEnabled: boolean;
  toggleRender: () => void;

  // Terminal output
  output: TerminalLine[];
  appendOutput: (lines: TerminalLine[]) => void;
  clearOutput: () => void;

  // Command history
  history: string[];
  historyIndex: number;
  pushHistory: (cmd: string) => void;
  navigateHistory: (direction: "up" | "down") => string;

  // Last command
  lastCommand: string | null;
  setLastCommand: (cmd: string | null) => void;

  // Device
  deviceType: DeviceType;
  setDeviceType: (type: DeviceType) => void;

  // Dynamic Data
  portfolioData: any | null;
  isLoadingData: boolean;
  fetchPortfolioData: () => Promise<void>;
}

// Zustand v5: create<T>()((set, get) => ...)
export const useTerminalStore = create<TerminalState>()((set, get) => ({
  // ─── Theme ───
  theme: "dark",
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

  // ─── Render ───
  renderEnabled: false,
  toggleRender: () => {
    const { deviceType } = get();
    if (deviceType === "mobile") return;
    set((s) => ({ renderEnabled: !s.renderEnabled }));
  },

  // ─── Output ───
  output: [],
  appendOutput: (lines) =>
    set((s) => ({ output: [...s.output, ...lines] })),
  clearOutput: () => set({ output: [] }),

  // ─── History ───
  history: [],
  historyIndex: -1,
  pushHistory: (cmd) =>
    set((s) => ({
      history: [...s.history, cmd],
      historyIndex: -1,
    })),
  navigateHistory: (direction) => {
    const { history, historyIndex } = get();
    if (history.length === 0) return "";

    let newIndex: number;

    if (direction === "up") {
      newIndex =
        historyIndex === -1
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
    } else {
      if (historyIndex === -1) return "";
      newIndex = historyIndex + 1;
      if (newIndex >= history.length) {
        set({ historyIndex: -1 });
        return "";
      }
    }

    set({ historyIndex: newIndex });
    return history[newIndex];
  },

  // ─── Last Command ───
  lastCommand: null,
  setLastCommand: (cmd) => set({ lastCommand: cmd }),

  // ─── Device ───
  deviceType: "desktop",
  setDeviceType: (type) => set({ deviceType: type }),

  // ─── Dynamic Data ───
  portfolioData: null,
  isLoadingData: false,
  fetchPortfolioData: async () => {
    set({ isLoadingData: true });
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        set({ portfolioData: data });
      } else {
        console.error("Failed to fetch portfolio data", res.status);
      }
    } catch (err) {
      console.error("Error fetching portfolio data", err);
    } finally {
      set({ isLoadingData: false });
    }
  },
}));