import type { TerminalLine } from "@/store/useTerminalStore";
import { useTerminalStore } from "@/store/useTerminalStore";
import { PORTFOLIO_DATA } from "@/lib/portfolioData";
import {
  parseCommand,
  suggestCommand,
  line,
  cmdLine,
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
  caseStudy?: { heading: string; lines: string[] }[];
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
    const p = PORTFOLIO_DATA.PROFILE;

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
      line("  I build AI systems end to end — from training", "text"),
      line("  models to shipping the product around them.", "text"),
      line("  Recently: a wafer-defect CNN and 14-tool MCP agent", "text"),
      line("  (YieldGuard, IBM Bob Hackathon runners-up), and a", "text"),
      line("  real-time Hindi voice sales agent (Vaani).", "text"),
      EMPTY,
      line("  I care about AI that is honest about what it knows:", "text"),
      line("  cited evidence, calibrated uncertainty, and models", "text"),
      line("  that abstain instead of guessing.", "text"),
      EMPTY,
    ];
  },

  skills: () => {
    const s = PORTFOLIO_DATA.SKILLS;

    const lines: TerminalLine[] = [
      EMPTY,
      line("  TECHNICAL SKILLS", "accent"),
      line("  ──────────────────────────────────────", "accent"),
      EMPTY,
    ];
    const icons: Record<string, string> = {
      languages: "Languages",
      ai: "AI / ML",
      frontend: "Frontend",
      backend: "Backend",
      databases: "Databases",
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
    const pData = PORTFOLIO_DATA.PROJECTS;

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
    const isMobile = useTerminalStore.getState().deviceType === "mobile";
    filteredProjects.forEach((p: any) => {
      // Title is tappable: the only way into `project <name>` without a keyboard
      const tag = p.caseStudy ? "  · case study" : "";
      lines.push(cmdLine(`  ${p.title}  (${p.year})${tag}`, "green", `project ${p.name}`));
      lines.push(line(`    ${p.description}`, "text"));
      lines.push(line(`    Tech: ${p.tech.join(", ")}`, "textDim"));
      lines.push(line(`    Impact: ${p.impact}`, "yellow"));
      lines.push(EMPTY);
    });
    lines.push(
      line(
        isMobile
          ? "  Tap a project title for details."
          : '  Click a project title, or type "project <name>":',
        "textDim"
      )
    );
    if (!isMobile) {
      lines.push(
        line(`  ${filteredProjects.map((p: any) => p.name).join(", ")}`, "accent")
      );
    }
    lines.push(EMPTY);
    return lines;
  },

  project: (args) => {
    const pData = PORTFOLIO_DATA.PROJECTS;

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
      line(`  Tech:    ${p.tech.join(", ")}`, "textDim"),
      line(`  Impact:  ${p.impact}`, "yellow"),
      line(`  Link:    ${p.link}`, "accent", p.link.startsWith("http") ? p.link : `https://${p.link}`),
      line(`  Year:    ${p.year}`, "textDim"),
      EMPTY,
      // Case study: what was built, what failed, what the numbers say
      ...(p.caseStudy ?? []).flatMap(
        (section: { heading: string; lines: string[] }) => [
          line(`  ${section.heading}`, "accent"),
          ...section.lines.map((l) => line(`  • ${l}`, "text")),
          EMPTY,
        ]
      ),
    ];
  },

  experience: () => {
    const eData = PORTFOLIO_DATA.EXPERIENCE_DATA;

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
    const aData = PORTFOLIO_DATA.ACHIEVEMENTS;

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
    const p = PORTFOLIO_DATA.PROFILE;

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
    const next = useTerminalStore.getState().renderEnabled;
    if (!next && !store.renderEnabled) {
      // toggleRender refused to open: no WebGL in this browser
      return [
        EMPTY,
        line("  3D needs WebGL, which this browser has turned off.", "yellow"),
        EMPTY,
      ];
    }
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
    const p = PORTFOLIO_DATA.PROFILE;

    return [
      EMPTY,
      line(`  ${p.name} — ${p.title}`, "green"),
      EMPTY,
    ];
  },

  neofetch: () => {
    // ASCII only: JetBrains Mono is loaded with the latin subset, so block
    // glyphs (▄ █ ▀) fell back to another font with other widths and broke the
    // column. Art and info share one column computed from the widest art row.
    const art = [
      " ____    _",
      "|  _ \\  / \\",
      "| | | |/ _ \\",
      "| |_| / ___ \\",
      "|____/_/   \\_\\",
      "",
      "",
    ];
    const info = [
      "dhrumil@portfolio",
      "-----------------",
      "Framework: Next.js 16",
      "UI: React 19",
      "3D: React Three Fiber 9",
      "State: Zustand 5",
      "Style: Tailwind CSS 4",
    ];
    const width = Math.max(...art.map((a) => a.length)) + 4;
    return [
      EMPTY,
      ...art.map((a, i) =>
        line(`  ${a.padEnd(width)}${info[i] ?? ""}`, i < 2 ? "accent" : "text")
      ),
      EMPTY,
    ];
  },

  sudo: (args) => {
    if (args.join(" ") === "unlock") {
      return [
        EMPTY,
        line("  Easter egg unlocked!", "accent"),
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
  const p = PORTFOLIO_DATA.PROFILE;

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