"use client";

import { Component, type ReactNode } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";

// If the 3D canvas throws (e.g. the browser refuses a WebGL context), close the
// panel instead of letting the error unmount the whole page. The terminal is
// the portfolio; the 3D panel is optional.
export default class RenderBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[RenderBoundary] 3D render failed, closing panel:", error);
    const store = useTerminalStore.getState();
    if (store.renderEnabled) store.toggleRender();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
