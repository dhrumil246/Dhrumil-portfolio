// Three.js materials can't read CSS custom properties, so the 3D scenes use
// these literals. They mirror the tokens in src/app/globals.css — change both.
export const PALETTE = {
  dark: {
    bg: "#0a0c0b", // --bg
    surface: "#0f1210", // --surface
    border: "#212723", // --border
    text: "#e4e9e5", // --text
    textDim: "#8b958e", // --text-dim
    accent: "#a3e635", // --accent
    die: "#353d37", // passing die (unlit, exact): visible, and under the dark-mode bloom threshold
  },
  light: {
    bg: "#f5f6f4",
    surface: "#ffffff",
    border: "#dcdfd9",
    text: "#171b18",
    textDim: "#58615a",
    accent: "#3f6212",
    die: "#c4ccc1",
  },
} as const;

export type Theme = keyof typeof PALETTE;
