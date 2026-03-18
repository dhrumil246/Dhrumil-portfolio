// postcss.config.mjs
// Tailwind CSS v4 uses @tailwindcss/postcss (replaces old tailwindcss plugin)
// No tailwind.config.ts needed — all config lives in globals.css via @theme
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;