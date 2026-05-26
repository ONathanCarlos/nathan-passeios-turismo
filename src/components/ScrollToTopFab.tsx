import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTopFab = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        bottom: "calc(max(1.25rem, env(safe-area-inset-bottom)) + 4.25rem)",
        right: "1rem",
      }}
      className="z-[60] flex items-center justify-center w-11 h-11 rounded-full bg-turquoise/90 text-night shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] backdrop-blur-sm border border-turquoise-glow/60 hover:bg-turquoise transition-colors"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
