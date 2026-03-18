import type { TerminalLine } from "@/store/useTerminalStore";
import { useTerminalStore } from "@/store/useTerminalStore";
import {
  parseCommand,
  suggestCommand,
  line,
  EMPTY,
  type ParsedCommand,
} from "@/lib/commandParser";

// ─── Portfolio Data Types ───

export interface Project {
  name: string;
  title: string;
  description: string;
  tech: string[];
  role: string;
  impact: string;
  link: string;
  year: string;
}


export interface Experience {
  company: string;
  role: string;
  period: string;
  highlights: string[];
}


// ─── Command Handlers ───
type CommandHandler = (
  args: string[],
  flags: Record<string, string | boolean>
) => TerminalLine[];

const commands: Record<string, CommandHandler> = {
  help: () => [
    EMPTY,
    line("  AVAILABLE COMMANDS", "accent"),
    line("  ──────────────────────────────────────", "accent"),
    EMPTY,
    line("  about           Who I am", "text"),
    line("  skills          Technical expertise", "text"),
    line("  projects        Featured work [flags: --year, --tech]", "text"),
    line("  project <name>  Deep dive into a project", "text"),
    line("  experience      Work history", "text"),
    line("  achievements    Milestones & awards", "text"),
    line("  resume          Download my resume", "text"),
    line("  contact         Get in touch", "text"),
    line("  theme           Toggle dark/light mode", "text"),
    line("  render          Toggle 3D render mode", "text"),
    line("  clear           Clear terminal", "text"),
    EMPTY,
    line("  Tip: Use ↑↓ for history, TAB for autocomplete", "textDim"),
    EMPTY,
  ],

  about: () => {
    const data = useTerminalStore.getState().portfolioData;
    const p = data?.PROFILE;
    
    if (!p) return [EMPTY, line("  Data not loaded yet. Try again in a moment.", "yellow"), EMPTY];

    return [
      EMPTY,
      line(`  ${p.name}`, "accent"),
      line("  ──────────────────────────────────────", "accent"),
      EMPTY,
      line(`  ${p.title}`, "green"),
      line(`  ${p.tagline}`, "text"),
      EMPTY,
      line(`  Location:    ${p.location}`, "textDim"),
      line(`  Experience:  ${p.experience}`, "textDim"),
      EMPTY,
      line("  I build tools that engineers actually want to", "text"),
      line("  use. Passionate about developer experience,", "text"),
      line("  performance optimization, and clean abstractions.", "text"),
      EMPTY,
    ];
  },

  skills: () => {
    const data = useTerminalStore.getState().portfolioData;
    const s = data?.SKILLS;

    if (!s) return [EMPTY, line("  Data not loaded yet. Try again in a moment.", "yellow"), EMPTY];

    const lines: TerminalLine[] = [
      EMPTY,
      line("  TECHNICAL SKILLS", "accent"),
      line("  ──────────────────────────────────────", "accent"),
      EMPTY,
    ];
    const icons: Record<string, string> = {
      languages: "Languages",
      frontend: "Frontend",
      backend: "Backend",
      devops: "DevOps",
      tools: "Tools",
    };
    Object.entries(s).forEach(([cat, items]) => {
      const label = icons[cat] || cat;
      lines.push(line(`  ${label}`, "green"));
      const bar = (items as string[]).map((itm: string) => `[${itm}]`).join(" ");
      lines.push(line(`    ${bar}`, "textDim"));
      lines.push(EMPTY);
    });
    return lines;
  },

  projects: (args, flags) => {
    const data = useTerminalStore.getState().portfolioData;
    const pData = data?.PROJECTS;
    
    if (!pData) return [EMPTY, line("  Data not loaded yet. Try again in a moment.", "yellow"), EMPTY];

    let filteredProjects = pData;

    // Apply filters if passed via flags
    if (flags.year) {
      filteredProjects = filteredProjects.filter((p: any) => p.year === flags.year);
    }
    if (flags.tech) {
      const targetTech = String(flags.tech).toLowerCase();
      filteredProjects = filteredProjects.filter((p: any) =>
        p.tech.some((t: string) => t.toLowerCase() === targetTech)
      );
    }

    if (filteredProjects.length === 0) {
      return [
        EMPTY,
        line(`  No projects matched your filters.`, "yellow"),
        EMPTY,
      ];
    }

    const lines: TerminalLine[] = [
      EMPTY,
      line("  FEATURED PROJECTS", "accent"),
      line("  ──────────────────────────────────────", "accent"),
      EMPTY,
    ];
    filteredProjects.forEach((p: any) => {
      lines.push(line(`  ${p.title}  (${p.year})`, "green"));
      lines.push(line(`    ${p.description}`, "text"));
      lines.push(line(`    Tech: ${p.tech.join(", ")}`, "textDim"));
      lines.push(line(`    Impact: ${p.impact}`, "yellow"));
      lines.push(EMPTY);
    });
    lines.push(line('  Type "project <name>" for details:', "textDim"));
    lines.push(
      line(`  ${filteredProjects.map((p: any) => p.name).join(", ")}`, "accent")
    );
    lines.push(EMPTY);
    return lines;
  },

  project: (args) => {
    const data = useTerminalStore.getState().portfolioData;
    const pData = data?.PROJECTS;
    
    if (!pData) return [EMPTY, line("  Data not loaded yet. Try again in a moment.", "yellow"), EMPTY];

    if (!args[0]) {
      return [
        EMPTY,
        line("  Usage: project <name>", "yellow"),
        line(
          `  Available: ${pData.map((p: any) => p.name).join(", ")}`,
          "textDim"
        ),
        EMPTY,
      ];
    }
    const p = pData.find((pr: any) => pr.name === args[0].toLowerCase());
    if (!p) {
      return [
        EMPTY,
        line(`  Project "${args[0]}" not found.`, "red"),
        line(
          `  Available: ${pData.map((pr: any) => pr.name).join(", ")}`,
          "textDim"
        ),
        EMPTY,
      ];
    }
    return [
      EMPTY,
      line(`  ${p.title}`, "accent"),
      line("  ──────────────────────────────────────", "accent"),
      EMPTY,
      line(`  ${p.description}`, "text"),
      EMPTY,
      line(`  Role:    ${p.role}`, "green"),
      line(`  Tech:    ${p.tech.join(", ")}`, "cyan"),
      line(`  Impact:  ${p.impact}`, "yellow"),
      line(`  Link:    ${p.link}`, "orange", p.link.startsWith("http") ? p.link : `https://${p.link}`),
      line(`  Year:    ${p.year}`, "textDim"),
      EMPTY,
    ];
  },

  experience: () => {
    const data = useTerminalStore.getState().portfolioData;
    const eData = data?.EXPERIENCE_DATA;
    
    if (!eData) return [EMPTY, line("  Data not loaded yet. Try again in a moment.", "yellow"), EMPTY];

    const lines: TerminalLine[] = [
      EMPTY,
      line("  WORK EXPERIENCE", "accent"),
      line("  ──────────────────────────────────────", "accent"),
      EMPTY,
    ];
    eData.forEach((e: any) => {
      lines.push(line(`  ${e.company}`, "green"));
      lines.push(line(`  ${e.role}  ·  ${e.period}`, "text"));
      lines.push(EMPTY);
      e.highlights.forEach((h: string) => {
        lines.push(line(`    • ${h}`, "text"));
      });
      lines.push(EMPTY);
    });
    return lines;
  },

  achievements: () => {
    const data = useTerminalStore.getState().portfolioData;
    const aData = data?.ACHIEVEMENTS;
    
    if (!aData) return [EMPTY, line("  Data not loaded yet. Try again in a moment.", "yellow"), EMPTY];

    const lines: TerminalLine[] = [
      EMPTY,
      line("  NOTABLE ACHIEVEMENTS", "accent"),
      line("  ──────────────────────────────────────", "accent"),
      EMPTY,
    ];
    aData.forEach((a: string) => {
      lines.push(line(`    ★  ${a}`, "green"));
    });
    lines.push(EMPTY);
    return lines;
  },

  resume: () => {
    if (typeof window !== "undefined") {
      window.open("/resume.pdf", "_blank");
    }
    return [
      EMPTY,
      line("  Opening resume.pdf in new tab...", "green"),
      EMPTY,
    ];
  },

  contact: () => {
    const data = useTerminalStore.getState().portfolioData;
    const p = data?.PROFILE;
    if (!p) return [EMPTY, line("  Data not loaded yet. Try again in a moment.", "yellow"), EMPTY];

    const lines: TerminalLine[] = [
      EMPTY,
      line("  GET IN TOUCH", "accent"),
      line("  ──────────────────────────────────────", "accent"),
      EMPTY,
    ];

    if (p.email) lines.push(line(`  Email     ${p.email}`, "text", `mailto:${p.email}`));
    if (p.github) lines.push(line(`  GitHub    ${p.github}`, "text", p.github.startsWith("http") ? p.github : `https://${p.github}`));
    if (p.linkedin) lines.push(line(`  LinkedIn  ${p.linkedin}`, "text", p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`));
    if (p.website) lines.push(line(`  Website   ${p.website}`, "text", p.website.startsWith("http") ? p.website : `https://${p.website}`));

    lines.push(EMPTY);
    lines.push(line("  Open to opportunities and collaborations.", "green"));
    lines.push(EMPTY);

    return lines;
  },

  theme: () => {
    const store = useTerminalStore.getState();
    store.toggleTheme();
    const next = store.theme === "dark" ? "light" : "dark";
    return [
      EMPTY,
      line(`  Theme switched to ${next} mode`, "green"),
      EMPTY,
    ];
  },

  render: () => {
    const store = useTerminalStore.getState();
    if (store.deviceType === "mobile") {
      return [
        EMPTY,
        line("  Render mode is disabled on mobile devices.", "yellow"),
        EMPTY,
      ];
    }
    store.toggleRender();
    const next = !store.renderEnabled;
    return [
      EMPTY,
      line(`  Render mode ${next ? "enabled" : "disabled"}`, "green"),
      EMPTY,
    ];
  },

  clear: () => {
    useTerminalStore.getState().clearOutput();
    return [];
  },

  // ─── Easter Eggs ───
  whoami: () => {
    const data = useTerminalStore.getState().portfolioData;
    const p = data?.PROFILE;
    if (!p) return [EMPTY, line("  Data not loaded yet. Try again in a moment.", "yellow"), EMPTY];

    return [
      EMPTY,
      line(`  ${p.name} — ${p.title}`, "green"),
      EMPTY,
    ];
  },

  neofetch: () => [
  EMPTY,
  line("         ▄▄▄▄▄▄▄          dhrumil@portfolio", "accent"),  // ← change alex to dhrumil
  line("        ██     ██          ──────────────", "accent"),
  line("       ██  ▄▄  ██         OS: Next.js 16", "text"),       // ← 16 → 14
  line("      ██  ████  ██        Shell: zsh", "text"),
  line("       ██  ▀▀  ██         State: Zustand v5", "text"),
  line("        ██     ██          Style: Tailwind v4", "text"),
  line("         ▀▀▀▀▀▀▀          Uptime: 1+ years", "text"),     // ← 4+ → 1+
  EMPTY,
],

  sudo: (args) => {
    if (args.join(" ") === "unlock") {
      return [
        EMPTY,
        line("  Easter egg unlocked!", "pink"),
        line("  You found the secret. Here's a cookie: 🍪", "yellow"),
        EMPTY,
      ];
    }
    return [
      EMPTY,
      line("  Permission denied. Nice try though.", "red"),
      EMPTY,
    ];
  },
};

// ─── Welcome Message ───
export function getWelcomeMessage(): TerminalLine[] {
  const data = useTerminalStore.getState().portfolioData;
  const p = data?.PROFILE;

  if (!p) {
    return [
      EMPTY,
      line("  Initializing...", "textDim"),
      EMPTY,
    ];
  }

  return [
    EMPTY,
    line(`  ${p.name}`, "accent"),
    line(`  ${p.title}`, "green"),
    EMPTY,
    line(`  ${p.tagline}`, "textDim"),
    EMPTY,
    line('  Type "help" for commands, or click a chip below.', "text"),
    EMPTY,
  ];
}

export function executeCommand(input: string): TerminalLine[] {
  const { command, args, flags } = parseCommand(input);

  if (!command) return [];

  const handler = commands[command];
  if (handler) return handler(args, flags);

  // Unknown command — suggest closest match
  const suggestion = suggestCommand(command);
  return [
    EMPTY,
    line(`  Command not found: ${command}`, "red"),
    ...(suggestion
      ? [line(`  Did you mean "${suggestion}"?`, "yellow")]
      : []),
    line('  Type "help" for available commands.', "textDim"),
    EMPTY,
  ];
}