import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const BORDER_RIPPLE_SELECTOR = [
  "button",
  "a[href]",
  '[role="button"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  "label:has([role='radio'])",
  ".btn-press",
].join(",");

// One delegated listener keeps button-border feedback lightweight.
if (typeof window !== "undefined") {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const addBorderRipple = (element: HTMLElement, clientX?: number, clientY?: number) => {
    if (reducedMotion.matches || element.matches(":disabled, [aria-disabled='true']")) return;

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = clientX === undefined ? rect.width / 2 : clientX - rect.left;
    const y = clientY === undefined ? rect.height / 2 : clientY - rect.top;
    const reach = Math.max(
      Math.hypot(x, y),
      Math.hypot(rect.width - x, y),
      Math.hypot(x, rect.height - y),
      Math.hypot(rect.width - x, rect.height - y),
    );

    const surface = document.createElement("span");
    surface.className = "border-ripple-surface";
    surface.style.setProperty("--border-ripple-x", `${x}px`);
    surface.style.setProperty("--border-ripple-y", `${y}px`);
    surface.style.setProperty("--border-ripple-reach", `${reach + 4}px`);
    surface.style.borderRadius = window.getComputedStyle(element).borderRadius;
    element.appendChild(surface);

    surface.addEventListener("animationend", () => surface.remove(), { once: true });
  };

  document.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const interactive = target.closest<HTMLElement>(BORDER_RIPPLE_SELECTOR);
    if (!interactive) return;
    // Buttons acting as form fields use the continuous focused-border wave instead.
    if (interactive.closest(".interactive-field") || interactive.matches('[role="combobox"]')) return;
    addBorderRipple(interactive, event.clientX, event.clientY);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const interactive = target.closest<HTMLElement>(BORDER_RIPPLE_SELECTOR);
    if (!interactive) return;
    if (interactive.closest(".interactive-field") || interactive.matches('[role="combobox"]')) return;
    addBorderRipple(interactive);
  });
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
