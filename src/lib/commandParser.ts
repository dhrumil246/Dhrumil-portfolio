import type { TerminalLine } from "@/store/useTerminalStore";

export interface ParsedCommand {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
  raw: string;
}

// All registered command names for autocomplete & typo matching
export const COMMAND_LIST = [
  "help",
  "about",
  "skills",
  "projects",
  "project",
  "experience",
  "resume",
  "contact",
  "theme",
  "render",
  "clear",
  "whoami",
  "neofetch",
  "sudo",
] as const;

export type CommandName = (typeof COMMAND_LIST)[number];

/**
 * Parse raw input string into structured command
 */
export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  
  const command = parts[0]?.toLowerCase() || "";
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith("--")) {
      const idx = part.indexOf("=");
      if (idx !== -1) {
        flags[part.substring(2, idx)] = part.substring(idx + 1);
      } else {
        flags[part.substring(2)] = true;
      }
    } else if (part.startsWith("-")) {
      flags[part.substring(1)] = true;
    } else {
      args.push(part);
    }
  }

  return {
    command,
    args,
    flags,
    raw: trimmed,
  };
}

/**
 * Colorize helper — creates a TerminalLine
 */
export function line(
  text: string,
  color: TerminalLine["color"] = "text",
  href?: string
): TerminalLine {
  return { text, color, ...(href && { href }) };
}

/**
 * Empty line shorthand
 */
export const EMPTY: TerminalLine = { text: "", color: "text" };

/**
 * Autocomplete — returns best match for partial input
 */
export function autocomplete(partial: string): string | null {
  if (!partial) return null;
  const lower = partial.toLowerCase();
  return (
    COMMAND_LIST.find((cmd) => cmd.startsWith(lower)) ?? null
  );
}

/**
 * Typo suggestion — finds closest command match
 */
export function suggestCommand(input: string): string | null {
  if (!input || input.length < 2) return null;
  const lower = input.toLowerCase();

  // Prefix match (first 2 chars)
  const prefixMatch = COMMAND_LIST.find((cmd) =>
    cmd.startsWith(lower.slice(0, 2))
  );
  if (prefixMatch) return prefixMatch;

  // Substring match
  const substringMatch = COMMAND_LIST.find((cmd) =>
    cmd.includes(lower.slice(1))
  );
  if (substringMatch) return substringMatch;

  // Levenshtein distance (simple)
  const distances = COMMAND_LIST.map((cmd) => ({
    cmd,
    dist: levenshtein(lower, cmd),
  }));
  const closest = distances.sort((a, b) => a.dist - b.dist)[0];
  if (closest && closest.dist <= 2) return closest.cmd;

  return null;
}

/**
 * Simple Levenshtein distance
 */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}