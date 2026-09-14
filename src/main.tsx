import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const RIPPLE_SELECTOR = [
  "button",
  "a[href]",
  '[role="button"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  ".btn-press",
].join(",");

// One delegated listener keeps touch, mouse and keyboard feedback lightweight.
if (typeof window !== "undefined") {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const addRipple = (element: HTMLElement, clientX?: number, clientY?: number) => {
    if (reducedMotion.matches || element.matches(":disabled, [aria-disabled='true']")) return;

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = clientX === undefined ? rect.width / 2 : clientX - rect.left;
    const y = clientY === undefined ? rect.height / 2 : clientY - rect.top;
    const radius = Math.max(
      Math.hypot(x, y),
      Math.hypot(rect.width - x, y),
      Math.hypot(x, rect.height - y),
      Math.hypot(rect.width - x, rect.height - y),
    );

    const surface = document.createElement("span");
    surface.className = "interaction-ripple-surface";
    surface.style.setProperty("--ripple-surface-top", `${rect.top}px`);
    surface.style.setProperty("--ripple-surface-left", `${rect.left}px`);
    surface.style.setProperty("--ripple-surface-width", `${rect.width}px`);
    surface.style.setProperty("--ripple-surface-height", `${rect.height}px`);
    surface.style.borderRadius = window.getComputedStyle(element).borderRadius;

    const ripple = document.createElement("span");
    ripple.className = "interaction-ripple";
    ripple.style.setProperty("--ripple-x", `${x}px`);
    ripple.style.setProperty("--ripple-y", `${y}px`);
    ripple.style.setProperty("--ripple-size", `${radius * 2}px`);
    surface.appendChild(ripple);
    document.body.appendChild(surface);

    ripple.addEventListener("animationend", () => surface.remove(), { once: true });
  };

  document.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const interactive = target.closest<HTMLElement>(RIPPLE_SELECTOR);
    if (!interactive) return;
    addRipple(interactive, event.clientX, event.clientY);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const interactive = target.closest<HTMLElement>(RIPPLE_SELECTOR);
    if (!interactive) return;
    addRipple(interactive);
  });
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
