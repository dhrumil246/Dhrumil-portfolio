export type DeviceType = "desktop" | "tablet" | "mobile";

export function detectDevice(): DeviceType {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator.userAgent.toLowerCase();
  const w = window.innerWidth;

  // Check for mobile user agents
  const isMobileUA =
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/.test(ua);

  // Check for tablet user agents
  const isTabletUA = /ipad|android(?!.*mobile)/.test(ua);

  // Touch capability check
  const hasTouch =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (isMobileUA || (hasTouch && w < 640)) return "mobile";
  if (isTabletUA || (hasTouch && w < 1024)) return "tablet";
  return "desktop";
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}