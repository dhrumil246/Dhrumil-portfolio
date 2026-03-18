"use client";

interface CommandChipsProps {
  onCommand: (cmd: string) => void;
  visible?: boolean;
}

const CHIPS = [
  "about",
  "skills",
  "projects",
  "experience",
  "contact",
  "resume",
] as const;

export default function CommandChips({ onCommand, visible = true }: CommandChipsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        padding: "10px 12px",
        borderTop: "1px solid var(--border)",
        background: "var(--header-bg)",
        flexShrink: 0,
      }}
      role="toolbar"
      aria-label="Quick commands"
    >
      {CHIPS.map((cmd, i) => (
        <button
          key={cmd}
          onClick={() => onCommand(cmd)}
          style={{
            background: "var(--chip-bg)",
            color: "var(--accent)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "5px 14px",
            fontSize: 12,
            fontFamily: "var(--font-mono), monospace",
            cursor: "pointer",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: `opacity 0.3s ease ${i * 0.06}s, transform 0.3s ease ${i * 0.06}s, background 0.15s ease, border-color 0.15s ease`,
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = "var(--chip-hover)";
            (e.target as HTMLButtonElement).style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = "var(--chip-bg)";
            (e.target as HTMLButtonElement).style.borderColor = "var(--border)";
          }}
          aria-label={`Run ${cmd} command`}
        >
          {cmd}
        </button>
      ))}
    </div>
  );
}