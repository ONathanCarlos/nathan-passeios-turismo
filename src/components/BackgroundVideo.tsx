import { useEffect, useRef, useState } from "react";
import { adminGetVideo, useAdminConfig } from "@/lib/adminConfig";

interface Props {
  desktopSrc: string;
  mobileSrc?: string;
}

/**
 * Vídeo de fundo com técnica "blur fill" no mobile:
 * - Camada de fundo: cópia do vídeo, esticada e desfocada (preenche bordas).
 * - Camada principal: vídeo original sem distorção (object-contain), centralizado.
 * Desktop usa simples object-cover (sem blur fill).
 */
export const BackgroundVideo = ({ desktopSrc, mobileSrc }: Props) => {
  const cfg = useAdminConfig();
  const desktop = adminGetVideo("desktop", desktopSrc);
  const mobile = adminGetVideo("mobile", mobileSrc || desktopSrc);

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);

  const mainRef = useRef<HTMLVideoElement>(null);
  const bgRef = useRef<HTMLVideoElement>(null);

  // Mantém os dois vídeos sincronizados (mobile)
  useEffect(() => {
    if (!isMobile) return;
    const a = mainRef.current, b = bgRef.current;
    if (!a || !b) return;
    const sync = () => { try { b.currentTime = a.currentTime; } catch {} };
    a.addEventListener("timeupdate", sync);
    return () => a.removeEventListener("timeupdate", sync);
  }, [isMobile, mobile]);

  if (isMobile) {
    return (
      <>
        {/* Camada de blur fill (preenche bordas) */}
        <video
          ref={bgRef}
          key={"bg-" + mobile}
          className="pointer-events-none fixed inset-0 z-0 w-full h-full object-cover scale-110 blur-2xl brightness-75"
          src={mobile}
          autoPlay loop muted playsInline preload="auto" aria-hidden="true"
        />
        {/* Vídeo principal sem deformação */}
        <video
          ref={mainRef}
          key={"main-" + mobile}
          className="pointer-events-none fixed inset-0 z-0 w-full h-full object-contain"
          src={mobile}
          autoPlay loop muted playsInline preload="auto" aria-hidden="true"
        />
      </>
    );
  }

  return (
    <video
      key={"d-" + desktop}
      className="pointer-events-none fixed inset-0 z-0 w-full h-full object-cover object-center"
      src={desktop}
      autoPlay loop muted playsInline preload="auto" aria-hidden="true"
    />
  );
};
