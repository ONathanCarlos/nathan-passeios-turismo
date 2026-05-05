import { ReactNode } from "react";

/**
 * Lightweight page transition wrapper.
 * - Animates opacity + translate3d only (compositor-only; no layout/paint impact).
 * - Promotes a single GPU layer per screen via `will-change` + `translate3d`.
 * - Uses `contain: paint` so the transition can't trigger ancestor reflows.
 * - Honors prefers-reduced-motion via the global rule in index.css.
 */
export const PageTransition = ({ children }: { children: ReactNode }) => {
  return <div className="page-transition">{children}</div>;
};
