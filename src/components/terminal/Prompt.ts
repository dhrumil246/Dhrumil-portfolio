/**
 * Prompt configuration
 *
 * Defines the visual prompt string and related formatting
 * for the terminal input line.
 */

export const PROMPT_SYMBOL = "❯";
export const PROMPT_USER = "visitor";
export const PROMPT_HOST = "portfolio";

/**
 * Returns the formatted prompt string
 * Example: "visitor@portfolio ❯ "
 */
export function getPromptString(): string {
  return `${PROMPT_USER}@${PROMPT_HOST} ${PROMPT_SYMBOL} `;
}

/**
 * Returns a minimal prompt for display in output history
 */
export function getHistoryPrompt(): string {
  return `  ${PROMPT_SYMBOL} `;
}

/**
 * Prompt configuration object
 */
export const PromptConfig = {
  symbol: PROMPT_SYMBOL,
  user: PROMPT_USER,
  host: PROMPT_HOST,
  color: "green" as const,
  symbolColor: "accent" as const,
} as const;