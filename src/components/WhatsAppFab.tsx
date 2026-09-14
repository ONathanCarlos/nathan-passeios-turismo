import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lang, dict } from "@/lib/i18n";
import { useConfig } from "@/lib/cms";

interface Props {
  lang: Lang;
}

const FALLBACK_WA = "5522998216796";

const MESSAGES: Record<Lang, string> = {
  pt: "Olá! Vim pelo site e gostaria de informações sobre os passeios.",
  es: "¡Hola! Vine por el sitio y me gustaría informaciones sobre los paseos.",
  en: "Hello! I came from the website and I'd like information about the tours.",
  fr: "Bonjour ! Je viens du site et j'aimerais des informations sur les excursions.",
  it: "Ciao! Vengo dal sito e vorrei informazioni sulle escursioni.",
};

export const WhatsAppFab = ({ lang }: Props) => {
  const t = dict[lang];
  const { data: cfg } = useConfig();
  const [showIdleLabel, setShowIdleLabel] = useState(false);
  const idleTimer = useRef<number | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const wa = (cfg?.whatsapp || FALLBACK_WA).replace(/\D/g, "");
  const url = `https://wa.me/${wa}?text=${encodeURIComponent(MESSAGES[lang])}`;

  useEffect(() => {
    const onScroll = () => {
      if (scrollFrame.current !== null) return;
      scrollFrame.current = window.requestAnimationFrame(() => {
        scrollFrame.current = null;
        setShowIdleLabel(false);
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => setShowIdleLabel(true), 1100);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  return createPortal(
    <div className="whatsapp-fab-wrap">
      <span
        className={`whatsapp-idle-label ${showIdleLabel ? "is-visible" : ""}`}
        aria-hidden={!showIdleLabel}
      >
        Fale conosco
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.whatsappSupport}
        className="whatsapp-fab wa-pulse"
      >
        <span className="whatsapp-fab-icon flex items-center justify-center w-8 h-8 rounded-full">
          <svg viewBox="0 0 32 32" className="w-5 h-5" aria-hidden="true">
            <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.745.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.79 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.302.13-.561.13-.762 0-.53-.057-.72-.486-.93-.428-.215-1.43-.701-1.96-.701zM16.066 6.733c-5.244 0-9.553 4.31-9.553 9.554 0 1.79.5 3.532 1.46 5.05L6 26.067l4.818-1.502a9.482 9.482 0 0 0 5.266 1.59h.014c5.252 0 9.561-4.309 9.561-9.553 0-2.55-1.075-4.945-2.864-6.756a9.49 9.49 0 0 0-6.729-2.713zm0 17.486h-.013a7.93 7.93 0 0 1-4.046-1.103l-.288-.172-3.022.945.96-2.937-.187-.302a7.929 7.929 0 0 1-1.218-4.252c0-4.382 3.561-7.943 7.943-7.943a7.886 7.886 0 0 1 5.61 2.32 7.881 7.881 0 0 1 2.327 5.616 7.972 7.972 0 0 1-7.957 7.928z" />
          </svg>
        </span>
        <span className="hidden sm:inline">{t.whatsappSupport}</span>
      </a>
    </div>,
    document.body,
  );
};
