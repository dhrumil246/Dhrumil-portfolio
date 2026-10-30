// Which 3D scene a command shows. Its own module so page.tsx can label the
// panel without importing RenderCanvas (which would defeat its lazy load).
export type SceneName = "wafer" | "projects";

export function sceneFor(lastCommand: string | null): SceneName {
  const cmd = lastCommand?.trim().toLowerCase() ?? "";
  // YieldGuard's case study is about these wafers, so show the evidence
  if (cmd === "project yieldguard") return "wafer";
  return cmd.startsWith("project") ? "projects" : "wafer";
}

export const SCENE_PATH: Record<SceneName, string> = {
  wafer: "render://wm-811k",
  projects: "render://projects",
};
