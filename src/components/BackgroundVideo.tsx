import { useEffect, useRef, useState } from "react";

interface Props {
  desktopSrc: string;
  mobileSrc?: string;
}

/**
 * Vídeo de fundo:
 * - Desktop: object-cover ocupando a tela.
 * - Mobile: vídeo vertical (9:16) repetido verticalmente preenchendo toda a
 *   altura da página, mantendo resolução, proporção e qualidade originais.
 *   Sem blur, sem deformação, sem redimensionamento forçado.
 */
export const BackgroundVideo = ({ desktopSrc, mobileSrc }: Props) => {
  const desktop = desktopSrc;
  const mobile = mobileSrc || desktopSrc;

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);

  const [tiles, setTiles] = useState(3);
  const refs = useRef<HTMLVideoElement[]>([]);

  // Calcula quantas repetições verticais precisamos para cobrir a página inteira
  useEffect(() => {
    if (!isMobile) return;
    const compute = () => {
      const vw = window.innerWidth;
      const tileH = (vw * 16) / 9; // proporção 9:16 mantida
      const pageH = Math.max(
        document.documentElement.scrollHeight,
        document.body?.scrollHeight || 0,
        window.innerHeight
      );
      setTiles(Math.max(1, Math.ceil(pageH / tileH) + 1));
    };
    compute();
    window.addEventListener("resize", compute);
    const ro = new ResizeObserver(compute);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("resize", compute);
      ro.disconnect();
    };
  }, [isMobile, mobile]);

  // Sincroniza todos os tiles para continuidade visual
  useEffect(() => {
    if (!isMobile) return;
    const master = refs.current[0];
    if (!master) return;
    const sync = () => {
      for (let i = 1; i < refs.current.length; i++) {
        const v = refs.current[i];
        if (!v) continue;
        if (Math.abs(v.currentTime - master.currentTime) > 0.08) {
          try { v.currentTime = master.currentTime; } catch {}
        }
      }
    };
    master.addEventListener("timeupdate", sync);
    return () => master.removeEventListener("timeupdate", sync);
  }, [isMobile, tiles, mobile]);

  if (isMobile) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-0 flex flex-col">
          {Array.from({ length: tiles }).map((_, i) => (
            <video
              key={`m-${i}-${mobile}`}
              ref={(el) => { if (el) refs.current[i] = el; }}
              className="block w-full h-auto"
              src={mobile}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          ))}
        </div>
      </div>
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
