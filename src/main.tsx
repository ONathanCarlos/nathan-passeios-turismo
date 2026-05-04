import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global ocean-ripple position tracker for buttons (premium press feedback)
if (typeof window !== "undefined") {
  const setRipple = (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const btn = target.closest('button, [role="button"], a.btn, .btn-press') as HTMLElement | null;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty("--ripple-x", `${x}%`);
    btn.style.setProperty("--ripple-y", `${y}%`);
  };
  document.addEventListener("pointerdown", setRipple, { passive: true });
}

createRoot(document.getElementById("root")!).render(<App />);
